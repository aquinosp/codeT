
"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Download } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { NewPurchaseSheet } from "./new-purchase-sheet"
import { useEffect, useState } from "react"
import type { Purchase } from "@/lib/types"
import { collection, getDocs, doc, getDoc, Timestamp, onSnapshot, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"


export function PurchasesTable() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

   useEffect(() => {
    const q = query(collection(db, "purchases"), orderBy("paymentDate", "desc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const purchaseList = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

        const purchasesData = await Promise.all(purchaseList.map(async (p) => {
            if (!p.supplierId || !p.itemId) return null;

            const supplierDoc = await getDoc(doc(db, "people", p.supplierId));
            const itemDoc = await getDoc(doc(db, "products", p.itemId));

            if (!supplierDoc.exists() || !itemDoc.exists()) return null;

            return {
                ...p,
                id: p.id,
                supplier: { id: supplierDoc.id, ...supplierDoc.data() },
                item: { id: itemDoc.id, ...itemDoc.data() },
                paymentDate: (p.paymentDate as Timestamp).toDate(),
            } as Purchase;
        }));
        
        setPurchases(purchasesData.filter(Boolean) as Purchase[]);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Filtrar por período
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="range" />
                    </PopoverContent>
                </Popover>
                 <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                </Button>
            </div>
            <NewPurchaseSheet />
        </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nota Fiscal</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Parcela</TableHead>
              <TableHead>Data Pagamento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell className="font-medium">{purchase.invoice || '-'}</TableCell>
                <TableCell>{purchase.supplier.name}</TableCell>
                <TableCell>{purchase.item.name}</TableCell>
                <TableCell>{purchase.installments}</TableCell>
                <TableCell>{new Intl.DateTimeFormat('pt-BR').format(purchase.paymentDate)}</TableCell>
                <TableCell className="text-right">
                  {purchase.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

    