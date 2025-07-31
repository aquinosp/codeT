import AppShell from '@/components/app-shell';
import { PurchasesTable } from '@/components/compras/purchases-table';

export default function ComprasPage() {
  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-3xl font-bold text-foreground">
            Gestão de Compras
          </h1>
        </div>
        <div className="flex-1 overflow-x-auto">
          <PurchasesTable />
        </div>
      </div>
    </AppShell>
  );
}
