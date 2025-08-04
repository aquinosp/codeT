"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, Timer, Printer } from "lucide-react"
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import type { ServiceOrder, ServiceOrderDocument } from "@/lib/types"
import { PaymentDialog } from "./payment-dialog"
import { NewOsSheet } from "./new-os-sheet"
import { collection, onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"


function getStatusVariant(status: ServiceOrder['status']) {
  switch (status) {
    case 'Entregue':
      return 'default'
    case 'Pronta':
      return 'secondary'
    case 'Em Progresso':
      return 'secondary'
    case 'Aguardando Peças':
        return 'destructive'
    case 'Pendente':
      return 'outline'
    default:
      return 'default'
  }
}

function SlaTimer({ date }: { date: Date }) {
  const [time, setTime] = useState("")

  useEffect(() => {
    const updateTimer = () => {
      const diff = new Date().getTime() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  },[date])

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
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "serviceOrders"), async (snapshot) => {
      const ordersDataPromises = snapshot.docs.map(async (d) => {
        const orderData = d.data() as ServiceOrderDocument;

        if (!orderData.customerId) {
          return null;
        }
        
        const customerDoc = await getDoc(doc(db, "people", orderData.customerId));
        if (!customerDoc.exists()) {
          return null;
        }
        const customer = { id: customerDoc.id, ...customerDoc.data() };

        const itemsPromises = (orderData.items || []).map(async (item) => {
          if (!item.productId) return null;
          const productDoc = await getDoc(doc(db, "products", item.productId));
          if (!productDoc.exists()) return null;
          return {
            id: productDoc.id,
            product: { id: productDoc.id, ...productDoc.data() },
            ...item
          };
        });
        const items = (await Promise.all(itemsPromises)).filter(Boolean) as ServiceOrder['items'];

        return {
          id: d.id,
          ...orderData,
          customer,
          items,
          createdAt: orderData.createdAt.toDate(),
        } as ServiceOrder;
      });
      const ordersData = (await Promise.all(ordersDataPromises)).filter(Boolean) as ServiceOrder[];
      setOrders(ordersData);
    });

    return () => unsubscribe();
  }, []);

  const handleMarkAsReady = async (order: ServiceOrder) => {
    const orderRef = doc(db, "serviceOrders", order.id);
    await updateDoc(orderRef, { status: 'Pronta' });
    toast({ title: "Status Atualizado!", description: `A OS ${order.osNumber} foi marcada como pronta.`})
  }

  const handlePayment = async (method: 'PIX' | 'Cartão' | 'Dinheiro') => {
    if (selectedOrder) {
      const orderRef = doc(db, "serviceOrders", selectedOrder.id);
      await updateDoc(orderRef, { status: 'Entregue', paymentMethod: method });
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
                  {order.status !== 'Entregue' && order.status !== 'Pronta' ? <SlaTimer date={order.createdAt} /> : '-'}
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
                      <DropdownMenuItem onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Imprimir</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleMarkAsReady(order)} disabled={order.status === 'Pronta' || order.status === 'Entregue'}>Marcar como Pronta</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedOrder(order)} disabled={order.status === 'Entregue'}>Registrar Entrega</DropdownMenuItem>
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
