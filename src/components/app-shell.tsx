"use client"

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar';
import NavMenu from '@/components/nav-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bike, LogOut, Settings, Bell, Search } from 'lucide-react';
import { Input } from './ui/input';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar collapsible="icon">
          <SidebarRail />
          <SidebarHeader>
            <div className="flex items-center gap-3 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bike className="h-6 w-6" />
              </div>
              <h1 className="font-semibold text-xl text-sidebar-foreground group-data-[collapsible=icon]:hidden">Tao Control</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <NavMenu />
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-3 p-3 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="profile picture" />
                <AvatarFallback>TB</AvatarFallback>
              </Avatar>
              <div className="flex-grow group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-semibold">Técnico Padrão</p>
                <p className="text-xs text-sidebar-foreground/70">Admin</p>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0 group-data-[collapsible=icon]:hidden">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-2">
                 <SidebarTrigger className="md:hidden" />
                 <div className="relative hidden md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Looking for something..." className="pl-8 w-64" />
                 </div>
            </div>
            <div className='flex items-center gap-2'>
                 <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                 </Button>
                 <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                 </Button>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
