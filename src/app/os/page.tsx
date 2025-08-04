
"use client"

import { useState } from 'react';
import AppShell from '@/components/app-shell';
import OsTabs from '@/components/os/os-tabs';

export default function OsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('lista');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'kanban') {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  };

  return (
    <AppShell sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
      <OsTabs onTabChange={handleTabChange} activeTab={activeTab} />
    </AppShell>
  );
}
