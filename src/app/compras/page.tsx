
import { collection, getDocs, query, orderBy, Timestamp, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Purchase, PurchaseDocument, Person } from '@/lib/types';
import AppShell from '@/components/app-shell';
import { PurchasesTable } from '@/components/compras/purchases-table';
import { PurchasesDashboard } from '@/components/compras/purchases-dashboard';


async function getPurchasesData() {
  const purchasesQuery = query(collection(db, "purchases"), orderBy("paymentDate", "desc"));
  const purchasesSnapshot = await getDocs(purchasesQuery);
  const purchaseList = purchasesSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as PurchaseDocument));

  const purchasesData = await Promise.all(purchaseList.map(async (p) => {
      if (!p.supplierId) return null;
      const supplierDoc = await getDoc(doc(db, "people", p.supplierId));
      if (!supplierDoc.exists()) return null;

      return {
          id: p.id,
          ...p,
          supplier: { id: supplierDoc.id, ...supplierDoc.data() as Person },
          paymentDate: p.paymentDate.toDate(),
      } as Purchase;
  }));
  
  const purchases = purchasesData.filter(Boolean) as Purchase[];

  const totalPaid = purchases
    .filter(p => p.status === 'Pago')
    .reduce((acc, p) => acc + p.total, 0);
  
  const totalPending = purchases
    .filter(p => p.status === 'Previsão')
    .reduce((acc, p) => acc + p.total, 0);

  const expensesByMonth = purchases
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


  return { purchases, totalPaid, totalPending, expensesByMonth };
}


export default async function ComprasPage() {
  const { purchases, totalPaid, totalPending, expensesByMonth } = await getPurchasesData();

  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-3xl font-bold text-foreground">
            Gestão de Compras
          </h1>
        </div>
        <PurchasesDashboard 
          totalPaid={totalPaid} 
          totalPending={totalPending}
          expensesByMonth={expensesByMonth}
        />
        <div className="flex-1 overflow-x-auto">
          <PurchasesTable purchases={purchases} />
        </div>
      </div>
    </AppShell>
  );
}
