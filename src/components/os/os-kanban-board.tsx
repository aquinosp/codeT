"use client"

import React, { useState, DragEvent, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ServiceOrder, ServiceOrderDocument } from '@/lib/types';
import { MoreHorizontal, Timer } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PaymentDialog } from './payment-dialog';
import { NewOsSheet } from './new-os-sheet';
import { collection, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

type Status = ServiceOrder['status'];

const columns: Status[] = ['Aguardando', 'Em Progresso', 'Concluído'];
const columnTitles: Record<Status, string> = {
  'Aguardando': 'Aguardando',
  'Em Progresso': 'Em Progresso',
  'Concluído': 'Concluído',
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
    const interval = setInterval(updateTimer, 60000);
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
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [draggedOrder, setDraggedOrder] = useState<string | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<ServiceOrder | null>(null);

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
    
    if (order && newStatus === 'Concluído' && order.status !== 'Concluído') {
        setPaymentOrder(order);
    } else if (order) {
        const orderRef = doc(db, "serviceOrders", orderId);
        await updateDoc(orderRef, { status: newStatus });
    }
  };

  const handlePaymentConfirm = async (method: ServiceOrder['paymentMethod']) => {
    if(paymentOrder){
       const orderRef = doc(db, "serviceOrders", paymentOrder.id);
       await updateDoc(orderRef, { status: 'Concluído', paymentMethod: method });
    }
    setPaymentOrder(null);
  }

  return (
    <>
    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map(status => (
        <div
          key={status}
          className="rounded-lg bg-secondary/50 p-4 flex flex-col gap-4"
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
                        {order.status !== 'Concluído' && <DropdownMenuItem onClick={() => setPaymentOrder(order)}>Concluir</DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm font-medium">{order.customer.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{order.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                       <Badge variant="outline">{order.technician}</Badge>
                       {order.status !== 'Concluído' && <SlaTimer date={order.createdAt} />}
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
