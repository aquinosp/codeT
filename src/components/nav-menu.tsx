"use client"

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Wrench, ShoppingCart, ClipboardList } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/os', label: 'Ordens de Serviço', icon: Wrench },
  { href: '/compras', label: 'Compras', icon: ShoppingCart },
  { href: '/cadastros', label: 'Cadastros', icon: ClipboardList },
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
];

export default function NavMenu() {
  const pathname = usePathname();

  return (
    <div className="flex w-full flex-col gap-0 p-2">
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              className={cn(
                "justify-start text-base font-normal h-12",
                pathname === item.href 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50",
                "group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:justify-center"
              )}
              tooltip={{content: item.label, side: "right", align: "center"}}
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
}
