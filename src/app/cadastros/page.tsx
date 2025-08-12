
'use client';

import AppShell from '@/components/app-shell';
import { RegistryTabs } from '@/components/cadastros/registry-tabs';

function CadastrosPage() {
  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-3xl font-bold text-foreground">
            Cadastros
          </h1>
        </div>
        <RegistryTabs />
      </div>
    </AppShell>
  );
}

export default CadastrosPage;
