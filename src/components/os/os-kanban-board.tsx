"use client"

import React, { useState, DragEvent, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ServiceOrder } from '@/lib/types';
import { MoreHorizontal, Timer } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { PaymentDialog } from './payment-dialog';
import { NewOsSheet } from './new-os-sheet';
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useServiceOrders } from '@/hooks/useServiceOrders';


type Status = ServiceOrder['status'];

const columns: Status[] = ['Pendente', 'Em Progresso', 'Aguardando Peças', 'Pronta', 'Entregue'];
const columnTitles: Record<Status, string> = {
  'Pendente': 'Pendente',
  'Em Progresso': 'Em Progresso',
  'Aguardando Peças': 'Aguardando Peças',
  'Pronta': 'Pronta',
  'Entregue': 'Entregue',
};

const columnColors: Record<Status, string> = {
    'Pendente': 'bg-blue-100 dark:bg-blue-900/40',
    'Em Progresso': 'bg-yellow-100 dark:bg-yellow-900/40',
    'Aguardando Peças': 'bg-orange-100 dark:bg-orange-900/40',
    'Pronta': 'bg-purple-100 dark:bg-purple-900/40',
    'Entregue': 'bg-green-100 dark:bg-green-900/40',
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

export function OsKanbanBoard() {
  const { orders } = useServiceOrders();
  const [draggedOrder, setDraggedOrder] = useState<string | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<ServiceOrder | null>(null);
  const { toast } = useToast();

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
    
    if (order && newStatus === 'Entregue' && order.status !== 'Entregue') {
        setPaymentOrder(order);
    } else if (order) {
        const orderRef = doc(db, "serviceOrders", orderId);
        await updateDoc(orderRef, { status: newStatus });
    }
  };

  const handlePaymentConfirm = async (method: ServiceOrder['paymentMethod']) => {
    if(paymentOrder){
       const orderRef = doc(db, "serviceOrders", paymentOrder.id);
       await updateDoc(orderRef, { status: 'Entregue', paymentMethod: method });
    }
    setPaymentOrder(null);
  }

  const handleSetStatus = async (orderId: string, status: Status) => {
    const orderRef = doc(db, "serviceOrders", orderId);
    await updateDoc(orderRef, { status });
    toast({ title: "Status Atualizado!", description: `A OS foi movida para ${status}.`})
  }


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
              .filter(order => order.status === status)
              .map(order => (
                <Card
                  key={order.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, order.id)}
                  className={`cursor-grab active:cursor-grabbing ${draggedOrder === order.id ? 'opacity-50' : ''}`}
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
                        <NewOsSheet isEditing order={order} trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Editar</DropdownMenuItem>} />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSetStatus(order.id, 'Pronta')}>Marcar como Pronta</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPaymentOrder(order)}>Registrar Entrega</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm font-medium">{order.customer.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{order.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                       <Badge variant="outline">{order.technician}</Badge>
                       {order.status !== 'Entregue' && order.status !== 'Pronta' && <SlaTimer date={order.createdAt} />}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
    {paymentOrder && (
        <PaymentDialog order={paymentOrder} onConfirm={handlePaymentConfirm} onOpenChange={(isOpen) => !isOpen && setPaymentOrder(null)} />
    )}
    </>
  );
}
