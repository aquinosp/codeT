

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
import { Menu, LogOut, Settings, Bell, Bike } from 'lucide-react';
import { useAppSettings } from '@/context/app-settings-context';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface AppShellProps {
    children: React.ReactNode;
    sidebarOpen?: boolean;
    onSidebarOpenChange?: (open: boolean) => void;
}

export default function AppShell({ children, sidebarOpen, onSidebarOpenChange }: AppShellProps) {
  const { appName, logoUrl } = useAppSettings();
  const [user] = useAuthState(auth);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={onSidebarOpenChange}>
      <div className="flex min-h-screen bg-background">
        <Sidebar side="left" collapsible="icon" variant="sidebar">
          <SidebarHeader className='p-2'>
            <div className="flex items-center gap-3 p-2">
               {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-8 w-auto" />
                ) : (
                  <Bike className="h-8 w-8 text-primary" />
                )}
              <h1 className="font-semibold text-xl text-sidebar-foreground group-data-[collapsible=icon]:hidden">{appName}</h1>
               <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:hidden" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <NavMenu />
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-3 p-3 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.photoURL || "https://placehold.co/40x40.png"} data-ai-hint="profile picture" />
                <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-grow group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-semibold">{user?.displayName}</p>
                <p className="text-xs text-sidebar-foreground/70">{user?.email}</p>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0 group-data-[collapsible=icon]:hidden" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-2">
                 <SidebarTrigger className="md:hidden" />
            </div>
            <div className='flex items-center gap-2'>
                 <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                 </Button>
                 <Button variant="ghost" size="icon" asChild>
                    <Link href="/configuracoes">
                        <Settings className="h-5 w-5" />
                    </Link>
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
