
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
import { Calendar as CalendarIcon, Download, MoreHorizontal } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { NewPurchaseSheet } from "./new-purchase-sheet"
import { useEffect, useState } from "react"
import type { Purchase } from "@/lib/types"
import { collection, doc, getDoc, onSnapshot, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Badge } from "../ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from "../ui/dropdown-menu"


export function PurchasesTable() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

   useEffect(() => {
    const q = query(collection(db, "purchases"), orderBy("paymentDate", "desc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const purchaseList = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

        const purchasesData = await Promise.all(purchaseList.map(async (p: any) => {
            if (!p.supplierId) return null;

            const supplierDoc = await getDoc(doc(db, "people", p.supplierId));
            if (!supplierDoc.exists()) return null;

            return {
                id: p.id,
                ...p,
                supplier: { id: supplierDoc.id, ...supplierDoc.data() },
                paymentDate: (p.paymentDate).toDate(),
            } as Purchase;
        }));
        
        setPurchases(purchasesData.filter(Boolean) as Purchase[]);
    });

    return () => unsubscribe();
  }, []);

  const getBadgeVariant = (status: Purchase['status']) => {
    switch (status) {
        case 'Pago':
            return 'default'
        case 'Previsão':
            return 'secondary'
        default:
            return 'outline'
    }
  }

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
              <TableHead>Data Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell className="font-medium">{purchase.invoice || '-'}</TableCell>
                <TableCell>{purchase.supplier.name}</TableCell>
                <TableCell>{purchase.itemName}</TableCell>
                <TableCell>{purchase.installments}</TableCell>
                <TableCell>{new Intl.DateTimeFormat('pt-BR').format(purchase.paymentDate)}</TableCell>
                <TableCell>
                    <Badge variant={getBadgeVariant(purchase.status)}>{purchase.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {purchase.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                 <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <NewPurchaseSheet isEditing purchase={purchase} trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Editar</DropdownMenuItem>} />
                      </DropdownMenuContent>
                    </DropdownMenu>
                 </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
