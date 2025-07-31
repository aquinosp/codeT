"use client"

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import NavMenu from '@/components/nav-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bike, LogOut } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-3 p-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bike className="h-6 w-6" />
              </div>
              <h1 className="font-headline text-xl font-bold text-primary">Tao Control</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <NavMenu />
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-3 p-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="profile picture" />
                <AvatarFallback>TB</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <p className="text-sm font-semibold">Técnico Padrão</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-start gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:hidden">
             <SidebarTrigger />
             <h1 className="font-headline text-lg font-bold text-primary">Tao Control</h1>
          </header>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
