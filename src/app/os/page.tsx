
"use client"

import { useState } from 'react';
import AppShell from '@/components/app-shell';
import OsTabs from '@/components/os/os-tabs';
import { OsReceipt } from '@/components/os/os-receipt';
import type { ServiceOrder } from '@/lib/types';
import { useServiceOrders, type DateRangeFilter } from '@/hooks/useServiceOrders';
import { PaymentDialog } from '@/components/os/payment-dialog';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DateRange } from 'react-day-picker';

function OsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('lista');
  const [orderToPrint, setOrderToPrint] = useState<ServiceOrder | null>(null);
  const [orderToDeliver, setOrderToDeliver] = useState<ServiceOrder | null>(null);
  
  const initialDateRange: DateRange = {
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  };
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>(initialDateRange);
  
  const { orders } = useServiceOrders(dateFilter);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'kanban') {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  };

  const handlePrint = (order: ServiceOrder) => {
    setOrderToPrint(order);
    setTimeout(() => {
      window.print();
      setOrderToPrint(null);
    }, 100);
  }

  const handleDeliver = (order: ServiceOrder) => {
    setOrderToDeliver(order);
  }

  const handlePaymentConfirm = async (method: ServiceOrder['paymentMethod']) => {
    if(orderToDeliver){
       const orderRef = doc(db, "serviceOrders", orderToDeliver.id);
       await updateDoc(orderRef, { status: 'Entregue', paymentMethod: method });
    }
    setOrderToDeliver(null);
  }

  return (
    <AppShell sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
      <OsTabs 
        orders={orders}
        onTabChange={handleTabChange} 
        activeTab={activeTab} 
        onPrint={handlePrint}
        onDeliver={handleDeliver}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
       />
       {orderToPrint && <OsReceipt order={orderToPrint} />}
       {orderToDeliver && <PaymentDialog order={orderToDeliver} onConfirm={handlePaymentConfirm} onOpenChange={(isOpen) => !isOpen && setOrderToDeliver(null)} />}
    </AppShell>
  );
}

export default OsPage;
