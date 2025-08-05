

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
import type { ServiceOrder } from "@/lib/types"
import { PaymentDialog } from "./payment-dialog"
import { NewOsSheet } from "./new-os-sheet"
import { doc, updateDoc } from "firebase/firestore"
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

interface OsTableProps {
  orders: ServiceOrder[];
  onPrint: (order: ServiceOrder) => void;
  onDeliver: (order: ServiceOrder) => void;
}


export function OsTable({ orders, onPrint, onDeliver }: OsTableProps) {
  const { toast } = useToast();

  const handleMarkAsReady = async (order: ServiceOrder) => {
    const orderRef = doc(db, "serviceOrders", order.id);
    await updateDoc(orderRef, { status: 'Pronta' });
    toast({ title: "Status Atualizado!", description: `A OS ${order.osNumber} foi marcada como pronta.`})
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
                <TableCell>{order.customer?.name || 'Não informado'}</TableCell>
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
                      <NewOsSheet isEditing order={order} onPrint={onPrint} onDeliver={onDeliver} trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Editar</DropdownMenuItem>} />
                      <DropdownMenuItem onClick={() => onPrint(order)}><Printer className="mr-2 h-4 w-4" /> Imprimir</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleMarkAsReady(order)} disabled={order.status === 'Pronta' || order.status === 'Entregue'}>Marcar como Pronta</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDeliver(order)} disabled={order.status === 'Entregue'}>Registrar Entrega</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
