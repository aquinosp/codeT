

"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, Timer, Printer, Trash2 } from "lucide-react"
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
import { NewOsSheet } from "./new-os-sheet"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog"


function getStatusVariant(status: ServiceOrder['status']) {
  switch (status) {
    case 'Entregue':
      return 'default'
    case 'Pronta':
      return 'secondary'
    case 'Em Progresso':
      return 'secondary'
    case 'Aguardando Peças':
        return 'outline'
    case 'Cancelada':
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
  const [orderToCancel, setOrderToCancel] = useState<ServiceOrder | null>(null);

  const handleMarkAsReady = async (order: ServiceOrder) => {
    const orderRef = doc(db, "serviceOrders", order.id);
    await updateDoc(orderRef, { status: 'Pronta' });
    toast({ title: "Status Atualizado!", description: `A OS ${order.osNumber} foi marcada como pronta.`})
  }
  
  const handleCancelConfirm = async () => {
    if (orderToCancel) {
      const orderRef = doc(db, "serviceOrders", orderToCancel.id);
      await updateDoc(orderRef, { status: 'Cancelada' });
      toast({
        title: "OS Cancelada",
        description: `A OS ${orderToCancel.osNumber} foi cancelada com sucesso.`,
        variant: "destructive"
      });
      setOrderToCancel(null);
    }
  };


  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">OS</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden lg:table-cell">SLA</TableHead>
              <TableHead className="text-right hidden md:table-cell">Valor Total</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className={order.status === 'Cancelada' ? 'bg-gray-100 dark:bg-gray-900/50' : ''}>
                <TableCell className="font-medium">{order.osNumber}</TableCell>
                <TableCell>
                  <div className="font-medium">{order.customer?.name || 'Não informado'}</div>
                  <div className="text-sm text-muted-foreground md:hidden">
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                     - {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {order.status !== 'Entregue' && order.status !== 'Pronta' && order.status !== 'Cancelada' ? <SlaTimer date={order.createdAt} /> : '-'}
                </TableCell>
                <TableCell className="text-right hidden md:table-cell">
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
                      <NewOsSheet isEditing order={order} onPrint={onPrint} onDeliver={onDeliver} trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={order.status === 'Cancelada'}>Editar</DropdownMenuItem>} />
                      <DropdownMenuItem onClick={() => onPrint(order)}><Printer className="mr-2 h-4 w-4" /> Imprimir</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleMarkAsReady(order)} disabled={order.status === 'Pronta' || order.status === 'Entregue' || order.status === 'Cancelada'}>Marcar como Pronta</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDeliver(order)} disabled={order.status === 'Entregue' || order.status === 'Cancelada'}>Registrar Entrega</DropdownMenuItem>
                       <DropdownMenuSeparator />
                       <DropdownMenuItem onClick={() => setOrderToCancel(order)} className="text-red-500 hover:text-red-500 focus:text-red-500" disabled={order.status === 'Cancelada'}>
                         <Trash2 className="mr-2 h-4 w-4" />
                         Cancelar OS
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
       {orderToCancel && (
        <AlertDialog open onOpenChange={(isOpen) => !isOpen && setOrderToCancel(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Cancelamento</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja cancelar a OS <span className="font-bold">{orderToCancel.osNumber}</span>? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Voltar</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelConfirm} className="bg-destructive hover:bg-destructive/90">
                Sim, cancelar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
