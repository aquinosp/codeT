import AppShell from '@/components/app-shell';
import { RegistryTabs } from '@/components/cadastros/registry-tabs';

export default function CadastrosPage() {
  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-4">
        <h1 className="font-headline text-3xl font-bold text-foreground">
          Cadastros
        </h1>
        <RegistryTabs />
      </div>
    </AppShell>
  );
}
