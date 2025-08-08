
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Purchase, PurchaseDocument } from '@/lib/types';
import AppShell from '@/components/app-shell';
import { PurchasesDashboard } from '@/components/compras/purchases-dashboard';


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
            monthData = { month: monthName, monthYear: monthYear, paid: 0, pending: 0 };
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


  return { totalPaid, totalPending, expensesByMonth };
}


export default async function ComprasDashboardPage() {
  const { totalPaid, totalPending, expensesByMonth } = await getPurchasesDashboardData();

  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-3xl font-bold text-foreground">
            Dashboard de Compras
          </h1>
        </div>
        <PurchasesDashboard 
          totalPaid={totalPaid} 
          totalPending={totalPending}
          expensesByMonth={expensesByMonth}
        />
      </div>
    </AppShell>
  );
}
