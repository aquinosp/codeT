
'use client';

import AppShell from '@/components/app-shell';
import { SettingsForm } from '@/components/configuracoes/settings-form';

function ConfiguracoesPage() {
  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-4">
        <h1 className="font-headline text-3xl font-bold text-foreground">
          Configurações
        </h1>
        <div className="max-w-2xl mx-auto w-full">
            <SettingsForm />
        </div>
      </div>
    </AppShell>
  );
}

export default ConfiguracoesPage;
