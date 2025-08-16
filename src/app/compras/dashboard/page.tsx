
'use client';

import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Purchase, PurchaseDocument } from '@/lib/types';
import AppShell from '@/components/app-shell';
import { PurchasesDashboard } from '@/components/compras/purchases-dashboard';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type DashboardData = {
  totalPaid: number;
  totalPending: number;
  expensesByMonth: { month: string, paid: number, pending: number }[];
};

function ComprasDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function getPurchasesDashboardData() {
      const purchasesQuery = query(collection(db, "purchases"), orderBy("paymentDate", "desc"));
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


      setData({ totalPaid, totalPending, expensesByMonth });
    }

    getPurchasesDashboardData();
  }, []);

  if (!data) {
    return (
        <AppShell>
             <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-4">
                <Skeleton className="h-10 w-80" />
                <div className="grid gap-4 md:grid-cols-3">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
                 <Skeleton className="h-80 w-full" />
             </div>
        </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-3xl font-bold text-foreground">
            Dashboard de Compras
          </h1>
        </div>
        <PurchasesDashboard 
          totalPaid={data.totalPaid} 
          totalPending={data.totalPending}
          expensesByMonth={data.expensesByMonth}
        />
      </div>
    </AppShell>
  );
}

export default ComprasDashboardPage;
