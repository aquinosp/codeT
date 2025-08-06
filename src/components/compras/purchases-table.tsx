
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
import { useState } from "react"
import type { Purchase } from "@/lib/types"
import { Badge } from "../ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from "../ui/dropdown-menu"
import type { DateRange } from "react-day-picker"

interface PurchasesTableProps {
  purchases: Purchase[];
}


export function PurchasesTable({ purchases }: PurchasesTableProps) {
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>();

  const filteredPurchases = purchases.filter(purchase => {
    if (!dateFilter?.from || !dateFilter?.to) return true;
    return purchase.paymentDate >= dateFilter.from && purchase.paymentDate <= dateFilter.to;
  })

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
                        <Calendar mode="range" selected={dateFilter} onSelect={setDateFilter} />
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
            {filteredPurchases.map((purchase) => (
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
