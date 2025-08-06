
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
    .filter(p => p.status === 'Pago')
    .reduce((acc, p) => {
        const month = p.paymentDate.toLocaleString('default', { month: 'short' });
        const existing = acc.find(item => item.month === month);
        if(existing) {
            existing.expense += p.total;
        } else {
            acc.push({ month, expense: p.total });
        }
        return acc;
    }, [] as { month: string, expense: number }[]);


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
