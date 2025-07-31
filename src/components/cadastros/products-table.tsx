"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockProducts } from "@/lib/data"
import { Progress } from "@/components/ui/progress"
import { NewProductSheet } from "./new-product-sheet"

export function ProductsTable() {
  return (
    <div className="space-y-4">
        <div className="flex items-center justify-end">
            <NewProductSheet />
        </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Preço Venda</TableHead>
              <TableHead>Estoque</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-mono text-xs">{product.code}</TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  {product.sellPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <span>{product.stock} / {product.minStock * 5}</span>
                        <Progress value={(product.stock / (product.minStock * 5)) * 100} className="w-24 h-2" />
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
