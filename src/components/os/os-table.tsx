"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, Timer } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import type { ServiceOrder, ServiceOrderDocument } from "@/lib/types"
import { PaymentDialog } from "./payment-dialog"
import { NewOsSheet } from "./new-os-sheet"
import { collection, onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"


function getStatusVariant(status: ServiceOrder['status']) {
  switch (status) {
    case 'Concluído':
      return 'default'
    case 'Em Progresso':
      return 'secondary'
    case 'Aguardando':
      return 'outline'
    default:
      return 'default'
  }
}

function SlaTimer({ date }: { date: Date }) {
  const [time, setTime] = useState("")

  useState(() => {
    const interval = setInterval(() => {
      const diff = new Date().getTime() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  })

  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <Timer className="h-4 w-4" />
      <span>{time}</span>
    </div>
  )
}


export function OsTable() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "serviceOrders"), async (snapshot) => {
      const ordersData = await Promise.all(snapshot.docs.map(async (d) => {
        const orderData = d.data() as ServiceOrderDocument;
        
        const customerDoc = await getDoc(doc(db, "people", orderData.customerId));
        const customer = { id: customerDoc.id, ...customerDoc.data() };

        const items = await Promise.all(orderData.items.map(async (item) => {
          const productDoc = await getDoc(doc(db, "products", item.productId));
          return {
            id: productDoc.id,
            product: { id: productDoc.id, ...productDoc.data() },
            ...item
          };
        }));

        return {
          id: d.id,
          ...orderData,
          customer,
          items,
          createdAt: orderData.createdAt.toDate(),
        } as ServiceOrder;
      }));
      setOrders(ordersData);
    });

    return () => unsubscribe();
  }, []);

  const handleComplete = (order: ServiceOrder) => {
    setSelectedOrder(order);
  }

  const handlePayment = async (method: 'PIX' | 'Cartão' | 'Dinheiro') => {
    if (selectedOrder) {
      const orderRef = doc(db, "serviceOrders", selectedOrder.id);
      await updateDoc(orderRef, { status: 'Concluído', paymentMethod: method });
    }
    setSelectedOrder(null)
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>OS</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>SLA</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.osNumber}</TableCell>
                <TableCell>{order.customer.name}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                </TableCell>
                <TableCell>
                  {order.status !== 'Concluído' ? <SlaTimer date={order.createdAt} /> : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <NewOsSheet isEditing order={order} trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Editar</DropdownMenuItem>} />
                      <DropdownMenuItem onClick={() => handleComplete(order)}>Concluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedOrder && (
        <PaymentDialog
          order={selectedOrder}
          onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}
          onConfirm={handlePayment}
        />
      )}
    </>
  )
}
