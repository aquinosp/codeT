
'use client';

import { collection, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Purchase, PurchaseDocument } from '@/lib/types';
import AppShell from '@/components/app-shell';
import { PurchasesDashboard } from '@/components/compras/purchases-dashboard';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
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
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
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

function ComprasDashboardPage() {
  const searchParams = useSearchParams();
  const period = (searchParams.get('period') as Period) || 'month';
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function getPurchasesDashboardData(period: Period) {
      const { start, end } = getPeriodDates(period);

      const startTimestamp = Timestamp.fromDate(start);
      const endTimestamp = Timestamp.fromDate(end);

      const purchasesQuery = query(
        collection(db, "purchases"), 
        where("paymentDate", ">=", startTimestamp),
        where("paymentDate", "<=", endTimestamp),
        orderBy("paymentDate", "desc")
      );
      const purchasesSnapshot = await getDocs(purchasesQuery);
      const purchaseList = purchasesSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as PurchaseDocument));

      const purchasesData = purchaseList.map(p => {
          return {
              ...p,
              paymentDate: p.paymentDate.toDate(),
          } as Purchase;
      });

      const totalPaid = purchasesData
        .filter(p => p.status === 'Pago')
        .reduce((acc, p) => acc + p.total, 0);

      const totalPending = purchasesData
        .filter(p => p.status === 'Previsão')
        .reduce((acc, p) => acc + p.total, 0);

      const expensesByMonth = purchasesData
        .reduce((acc, p) => {
            const monthYear = `${p.paymentDate.getFullYear()}-${(p.paymentDate.getMonth() + 1).toString().padStart(2, '0')}`;
            const monthName = p.paymentDate.toLocaleString('pt-BR', { month: 'short' });
            
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
      
      const expensesByWeek = purchasesData
        .reduce((acc, p) => {
            const weekStart = startOfWeek(p.paymentDate, { locale: ptBR });
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
    return (
        <AppShell>
             <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <Skeleton className="h-10 w-80" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-16" />
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-16" />
                    <Skeleton className="h-9 w-16" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
                 <Skeleton className="h-80 w-full" />
                 <Skeleton className="h-80 w-full mt-4" />
             </div>
        </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-4">
        <PurchasesDashboard 
          period={period}
          totalPaid={data.totalPaid} 
          totalPending={data.totalPending}
          expensesByMonth={data.expensesByMonth}
          expensesByWeek={data.expensesByWeek}
        />
      </div>
    </AppShell>
  );
}

export default ComprasDashboardPage;
