
"use client"

import { useState } from 'react';
import AppShell from '@/components/app-shell';
import OsTabs from '@/components/os/os-tabs';
import { OsReceipt } from '@/components/os/os-receipt';
import type { ServiceOrder } from '@/lib/types';
import { useServiceOrders, type DateFilter } from '@/hooks/useServiceOrders';

export default function OsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('lista');
  const [orderToPrint, setOrderToPrint] = useState<ServiceOrder | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
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

  return (
    <AppShell sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
      <OsTabs 
        orders={orders}
        onTabChange={handleTabChange} 
        activeTab={activeTab} 
        onPrint={handlePrint}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
       />
       {orderToPrint && <OsReceipt order={orderToPrint} />}
    </AppShell>
  );
}
