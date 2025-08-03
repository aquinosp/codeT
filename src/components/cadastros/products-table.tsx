"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { NewProductSheet } from "./new-product-sheet"
import { useEffect, useState } from "react"
import type { Product } from "@/lib/types"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { BulkImportSheet } from "./bulk-import-sheet"
import { Badge } from "../ui/badge"

export function ProductsTable() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const q = query(collection(db, "products"), orderBy("name", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Product[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setProducts(data);
        });
        return () => unsubscribe();
    }, []);

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-end gap-2">
            <BulkImportSheet
              collectionName="products"
              fields={['code', 'name', 'description', 'barcode', 'group', 'type', 'costPrice', 'sellPrice', 'stock', 'minStock', 'unit']}
              requiredFields={['code', 'name', 'type', 'group', 'costPrice', 'sellPrice']}
              numericFields={['costPrice', 'sellPrice', 'stock', 'minStock']}
              enumFields={{ 
                  'unit': ['un', 'kg', 'L', 'm'],
                  'type': ['Produto', 'Serviço'],
                  'group': ['ACESSÓRIO', 'PARTES', 'PEÇAS', 'PNEUMÁTICOS', 'RELAÇÃO', 'SERVIÇO']
              }}
             />
            <NewProductSheet />
        </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Preço Venda</TableHead>
              <TableHead>Estoque</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-mono text-xs">{product.code}</TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.group}</TableCell>
                <TableCell>
                    <Badge variant={product.type === 'Produto' ? 'secondary' : 'outline'}>{product.type}</Badge>
                </TableCell>
                <TableCell>
                  {product.sellPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell>
                    {product.type === 'Produto' ? (
                        <div className="flex items-center gap-2">
                            <span>{product.stock || 0} / {(product.minStock || 0) * 5}</span>
                            <Progress value={((product.stock || 0) / ((product.minStock || 0) * 5)) * 100} className="w-24 h-2" />
                        </div>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
