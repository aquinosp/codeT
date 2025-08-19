
import { Suspense } from 'react';
import AppShell from '@/components/app-shell';
import { ComprasDashboardClient } from '@/components/compras/compras-dashboard-client';
import { Skeleton } from '@/components/ui/skeleton';

function ComprasDashboardPage() {
  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-4">
        <Suspense fallback={<DashboardSkeleton />}>
          <ComprasDashboardClient />
        </Suspense>
      </div>
    </AppShell>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Skeleton className="h-10 w-80" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </>
  );
}

export default ComprasDashboardPage;
