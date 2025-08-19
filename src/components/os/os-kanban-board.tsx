

"use client"

import React, { useState, DragEvent, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Person, ServiceOrder } from '@/lib/types';
import { MoreHorizontal, Timer, Printer, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { NewOsSheet } from './new-os-sheet';
import { doc, updateDoc, collection, onSnapshot, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type Status = ServiceOrder['status'];

const columns: Status[] = ['Pendente', 'Em Progresso', 'Aguardando Peças', 'Pronta', 'Entregue'];
const columnTitles: Record<Status, string> = {
  'Pendente': 'Pendente',
  'Em Progresso': 'Em Progresso',
  'Aguardando Peças': 'Aguardando Peças',
  'Pronta': 'Pronta',
  'Entregue': 'Entregue',
  'Cancelada': 'Cancelada',
};

const columnColors: Record<Status, string> = {
    'Pendente': 'bg-blue-100 dark:bg-blue-900/40',
    'Em Progresso': 'bg-yellow-100 dark:bg-yellow-900/40',
    'Aguardando Peças': 'bg-orange-100 dark:bg-orange-900/40',
    'Pronta': 'bg-purple-100 dark:bg-purple-900/40',
    'Entregue': 'bg-green-100 dark:bg-green-900/40',
    'Cancelada': 'bg-gray-200 dark:bg-gray-800/40',
};

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
  }, [date]);

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Timer className="h-3 w-3" />
      <span>{time}</span>
    </div>
  )
}

function AssignTechnicianDialog({ 
    order, 
    technicians, 
    onOpenChange, 
    onConfirm 
}: { 
    order: ServiceOrder | null, 
    technicians: Person[], 
    onOpenChange: (isOpen: boolean) => void, 
    onConfirm: (technician: string) => void 
}) {
    const [selectedTechnician, setSelectedTechnician] = useState<string | undefined>();

    if (!order) return null;

    return (
        <Dialog open={!!order} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Atribuir Técnico</DialogTitle>
                    <DialogDescription>
                        É necessário atribuir um técnico para mover a OS <span className="font-bold">{order.osNumber}</span> para a próxima etapa.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Select onValueChange={setSelectedTechnician} value={selectedTechnician}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um técnico" />
                        </SelectTrigger>
                        <SelectContent>
                            {technicians.map(t => (
                                <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={() => selectedTechnician && onConfirm(selectedTechnician)} disabled={!selectedTechnician}>
                        Confirmar e Mover
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface OsKanbanBoardProps {
  orders: ServiceOrder[];
  onPrint: (order: ServiceOrder) => void;
  onDeliver: (order: ServiceOrder) => void;
}

export function OsKanbanBoard({ orders, onPrint, onDeliver }: OsKanbanBoardProps) {
  const [draggedOrder, setDraggedOrder] = useState<string | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<ServiceOrder | null>(null);
  const [orderToAssign, setOrderToAssign] = useState<{order: ServiceOrder, newStatus: Status} | null>(null);
  const [technicians, setTechnicians] = useState<Person[]>([]);
  const { toast } = useToast();

   useEffect(() => {
    const q = query(collection(db, 'people'), where('type', '==', 'Funcionário'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTechnicians(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person)));
    });
    return () => unsubscribe();
  }, []);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, orderId: string) => {
    e.dataTransfer.setData('text/plain', orderId);
    setDraggedOrder(orderId);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = async (e: DragEvent<HTMLDivElement>, newStatus: Status) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('text/plain');
    setDraggedOrder(null);
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;

    if (newStatus !== 'Pendente' && !order.technician) {
        setOrderToAssign({order, newStatus});
        return;
    }
    
    if (newStatus === 'Entregue' && order.status !== 'Entregue') {
        onDeliver(order);
    } else {
        const orderRef = doc(db, "serviceOrders", orderId);
        await updateDoc(orderRef, { status: newStatus });
    }
  };

  const handleSetStatus = async (order: ServiceOrder, status: Status) => {
     if (status !== 'Pendente' && !order.technician) {
        setOrderToAssign({order, newStatus: status});
        return;
    }
    
    if (status === 'Entregue') {
        onDeliver(order);
        return;
    }

    const orderRef = doc(db, "serviceOrders", order.id);
    await updateDoc(orderRef, { status });
    toast({ title: "Status Atualizado!", description: `A OS foi movida para ${status}.`})
  }
  
  const handleAssignTechnicianConfirm = async (technician: string) => {
    if (orderToAssign) {
      const { order, newStatus } = orderToAssign;
      const orderRef = doc(db, "serviceOrders", order.id);
      
      if (newStatus === 'Entregue') {
          await updateDoc(orderRef, { technician });
          const updatedOrder = { ...order, technician };
          onDeliver(updatedOrder);
      } else {
          await updateDoc(orderRef, { technician, status: newStatus });
          toast({ title: "Técnico Atribuído!", description: `A OS foi atribuída a ${technician} e movida.` });
      }

      setOrderToAssign(null);
    }
  };


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
    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
      {columns.map(status => (
        <div
          key={status}
          className={cn("rounded-lg p-4 flex flex-col gap-4", columnColors[status])}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, status)}
        >
          <h2 className="text-lg font-semibold">{columnTitles[status]}</h2>
          <div className="flex-1 space-y-4">
            {orders
              .filter(order => {
                  if (status === 'Entregue') {
                      return order.status === 'Entregue' || order.status === 'Cancelada';
                  }
                  return order.status === status;
              })
              .map(order => (
                <Card
                  key={order.id}
                  draggable={order.status !== 'Cancelada'}
                  onDragStart={(e) => handleDragStart(e, order.id)}
                  className={cn('cursor-grab active:cursor-grabbing', 
                    draggedOrder === order.id ? 'opacity-50' : '',
                    order.status === 'Cancelada' && 'bg-gray-200 dark:bg-gray-800 cursor-not-allowed'
                  )}
                >
                  <CardHeader className="p-4 flex-row items-center justify-between">
                     <CardTitle className="text-base">{order.osNumber}</CardTitle>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                           <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <NewOsSheet isEditing order={order} onPrint={onPrint} onDeliver={onDeliver} trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={order.status === 'Cancelada'}>Editar</DropdownMenuItem>} />
                        <DropdownMenuItem onClick={() => onPrint(order)}><Printer className="mr-2 h-4 w-4" /> Imprimir</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSetStatus(order, 'Pronta')} disabled={order.status === 'Cancelada' || order.status === 'Entregue'}>Marcar como Pronta</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSetStatus(order, 'Entregue')} disabled={order.status === 'Cancelada' || order.status === 'Entregue'}>Registrar Entrega</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setOrderToCancel(order)} className="text-red-500 hover:text-red-500 focus:text-red-500" disabled={order.status === 'Cancelada'}>
                         <Trash2 className="mr-2 h-4 w-4" />
                         Cancelar OS
                       </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm font-medium">{order.customer?.name || 'Não informado'}</p>
                    <p className="text-sm font-medium text-muted-foreground">{order.technician || 'Técnico não atribuído'}</p>
                    <p className="text-sm text-muted-foreground truncate mt-1">{order.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                       <Badge variant={order.status === 'Cancelada' ? 'secondary' : 'default'}>{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Badge>
                       {order.status !== 'Entregue' && order.status !== 'Pronta' && order.status !== 'Cancelada' && <SlaTimer date={order.createdAt} />}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
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
     <AssignTechnicianDialog 
        order={orderToAssign?.order ?? null}
        technicians={technicians}
        onOpenChange={(isOpen) => !isOpen && setOrderToAssign(null)}
        onConfirm={handleAssignTechnicianConfirm}
      />
    </>
  );
}
