
'use client';

import { collection, getDocs, query, orderBy, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Purchase, PurchaseDocument, Person } from '@/lib/types';
import AppShell from '@/components/app-shell';
import { PurchasesTable } from '@/components/compras/purchases-table';
import { withAuth } from '@/components/auth/withAuth';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';


async function getPurchasesData() {
  const purchasesQuery = query(collection(db, "purchases"), orderBy("paymentDate", "desc"));
  const purchasesSnapshot = await getDocs(purchasesQuery);
  const purchaseList = purchasesSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as PurchaseDocument));

  const purchasesData = await Promise.all(purchaseList.map(async (p) => {
      if (!p.supplierId) return null;
      const supplierDoc = await getDoc(doc(db, "people", p.supplierId));
      if (!supplierDoc.exists()) return null;

      const supplierData = supplierDoc.data() as Person;

      return {
          id: p.id,
          ...p,
          supplier: { 
            id: supplierDoc.id, 
            ...supplierData,
            createdAt: supplierData.createdAt ? supplierData.createdAt.toDate() : undefined,
          },
          paymentDate: p.paymentDate.toDate(),
      } as Purchase;
  }));
  
  const purchases = purchasesData.filter(Boolean) as Purchase[];

  return { purchases };
}


function ComprasPage() {
    const [purchases, setPurchases] = useState<Purchase[] | null>(null);
    
    useEffect(() => {
        getPurchasesData().then(({ purchases }) => setPurchases(purchases));
    }, []);

    if (!purchases) {
      return (
        <AppShell>
          <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-4">
              <Skeleton className="h-10 w-64" />
              <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                      <Skeleton className="h-9 w-40" />
                      <Skeleton className="h-9 w-10" />
                  </div>
                  <Skeleton className="h-10 w-32" />
              </div>
              <Skeleton className="h-[400px] w-full" />
          </div>
        </AppShell>
      )
    }

  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-3xl font-bold text-foreground">
            Lançamentos de Compras
          </h1>
        </div>
        <div className="flex-1 overflow-x-auto">
          <PurchasesTable purchases={purchases} />
        </div>
      </div>
    </AppShell>
  );
}

export default withAuth(ComprasPage);
