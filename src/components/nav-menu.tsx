
"use client"

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Wrench, ShoppingCart, ClipboardList, Settings, Bike, AreaChart, List } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';

const menuItems = [
  { href: '/os', label: 'Ordens de Serviço', icon: Wrench },
  { 
    label: 'Compras', 
    icon: ShoppingCart,
    subItems: [
        { href: '/compras/dashboard', label: 'Dashboard', icon: AreaChart },
        { href: '/compras', label: 'Lançamentos', icon: List }
    ]
  },
  { href: '/cadastros', label: 'Cadastros', icon: ClipboardList },
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

export default function NavMenu() {
  const pathname = usePathname();

  return (
    <div className="flex w-full flex-col gap-0 p-2">
      <SidebarMenu>
        {menuItems.map((item) => (
            item.subItems ? (
                 <Collapsible key={item.label} className="w-full" defaultOpen={pathname.startsWith('/compras')}>
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                             <SidebarMenuButton
                                className={cn(
                                    "justify-between text-base font-normal h-12",
                                    "group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:justify-center"
                                )}
                                tooltip={{content: item.label, side: "right", align: "center"}}
                             >
                                 <div className='flex items-center gap-2'>
                                    <item.icon className="h-5 w-5" />
                                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                                 </div>
                                 <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[collapsible=icon]:hidden group-data-[state=open]:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                    </SidebarMenuItem>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {item.subItems.map(subItem => (
                                 <SidebarMenuSubItem key={subItem.href}>
                                    <Link href={subItem.href} passHref legacyBehavior>
                                        <SidebarMenuSubButton isActive={pathname === subItem.href}>
                                            <subItem.icon className="h-4 w-4" />
                                            <span>{subItem.label}</span>
                                        </SidebarMenuSubButton>
                                    </Link>
                                </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                 </Collapsible>
            ) : (
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
            )
        ))}
      </SidebarMenu>
    </div>
  );
}

