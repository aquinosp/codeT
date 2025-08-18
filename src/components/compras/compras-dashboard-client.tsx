
'use client';

import { collection, getDocs, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Purchase, PurchaseDocument } from '@/lib/types';
import { PurchasesDashboard } from '@/components/compras/purchases-dashboard';
import { useEffect, useState } from 'react';
import { startOfWeek, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSearchParams } from 'next/navigation';
import type { Period } from '@/components/dashboard/dashboard-charts';

type DashboardData = {
  totalPaid: number;
  totalPending: number;
  expensesByMonth: { month: string, paid: number, pending: number }[];
  expensesByWeek: { week: string, paid: number, pending: number }[];
};


function getPeriodDates(period: Period) {
  const now = new Date();
  let start;
  let end = new Date();
  end.setHours(23, 59, 59, 999);

  switch (period) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      start = startOfWeek(now, { locale: ptBR });
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
       start = new Date(now.getFullYear(), now.getMonth(), 1);
       break;
  }
   start.setHours(0, 0, 0, 0);

  return { start, end };
}

export function ComprasDashboardClient() {
  const searchParams = useSearchParams();
  const period = (searchParams.get('period') as Period) || 'month';
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function getPurchasesDashboardData(period: Period) {
      const { start, end } = getPeriodDates(period);
      
      const purchasesQuery = query(collection(db, "purchases"));
      const purchasesSnapshot = await getDocs(purchasesQuery);
      const allPurchases = purchasesSnapshot.docs.map(doc => ({
        ...doc.data() as PurchaseDocument,
        id: doc.id,
        paymentDate: (doc.data().paymentDate as Timestamp).toDate(),
      }) as Purchase);

      const paidInPeriod = allPurchases.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        return p.status === 'Pago' && paymentDate >= start && paymentDate <= end;
      });

      const pendingInPeriod = allPurchases.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        return p.status === 'Previsão' && paymentDate >= start && paymentDate <= end;
      });
      
      const totalPaid = paidInPeriod.reduce((acc, p) => acc + p.total, 0);
      const totalPending = pendingInPeriod.reduce((acc, p) => acc + p.total, 0);
      
      const allPeriodPurchases = allPurchases.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        const isPaidInPeriod = p.status === 'Pago' && paymentDate >= start && paymentDate <= end;
        const isPendingInPeriod = p.status === 'Previsão' && paymentDate >= start && paymentDate <= end;
        return isPaidInPeriod || isPendingInPeriod;
      });


      const expensesByMonth = allPeriodPurchases
        .reduce((acc, p) => {
            const date = new Date(p.paymentDate);
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            const monthName = date.toLocaleString('pt-BR', { month: 'short' });
            
            let monthData = acc.find(item => item.monthYear === monthYear);
            if(!monthData) {
                monthData = { month: monthName.charAt(0).toUpperCase() + monthName.slice(1), monthYear: monthYear, paid: 0, pending: 0 };
                acc.push(monthData);
            }
            
            if (p.status === 'Pago') {
                monthData.paid += p.total;
            } else if (p.status === 'Previsão') {
                monthData.pending += p.total;
            }

            return acc;
        }, [] as { month: string, monthYear: string, paid: number, pending: number }[]);

      expensesByMonth.sort((a, b) => {
        return new Date(a.monthYear).getTime() - new Date(b.monthYear).getTime();
      });
      
      const expensesByWeek = allPeriodPurchases
        .reduce((acc, p) => {
            const date = new Date(p.paymentDate);
            const weekStart = startOfWeek(date, { locale: ptBR });
            const weekLabel = format(weekStart, "dd/MM", { locale: ptBR });
            
            let weekData = acc.find(item => item.week === weekLabel);
            if(!weekData) {
                weekData = { week: weekLabel, weekStart, paid: 0, pending: 0 };
                acc.push(weekData);
            }
            
            if (p.status === 'Pago') {
                weekData.paid += p.total;
            } else if (p.status === 'Previsão') {
                weekData.pending += p.total;
            }

            return acc;
        }, [] as { week: string, weekStart: Date, paid: number, pending: number }[]);
        
       expensesByWeek.sort((a, b) => {
        return a.weekStart.getTime() - b.weekStart.getTime();
      });

      setData({ totalPaid, totalPending, expensesByMonth, expensesByWeek });
    }

    setData(null);
    getPurchasesDashboardData(period);
  }, [period]);

  if (!data) {
     return null; // The parent component will show the skeleton
  }

  return (
    <PurchasesDashboard 
      period={period}
      totalPaid={data.totalPaid} 
      totalPending={data.totalPending}
      expensesByMonth={data.expensesByMonth}
      expensesByWeek={data.expensesByWeek}
    />
  );
}
