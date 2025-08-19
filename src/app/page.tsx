
import { Suspense } from 'react';
import AppShell from '@/components/app-shell';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { Skeleton } from '@/components/ui/skeleton';


function DashboardPage() {
  return (
    <AppShell>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardClient />
      </Suspense>
    </AppShell>
  );
}

function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Skeleton className="h-10 w-48" />
                <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-16" />
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Skeleton className="lg:col-span-4 h-80 w-full" />
                <Skeleton className="lg:col-span-3 h-80 w-full" />
            </div>
             <Skeleton className="h-80 w-full" />
             <Skeleton className="h-96 w-full" />
        </div>
    );
}

export default DashboardPage;
