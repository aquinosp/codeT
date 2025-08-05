import AppShell from '@/components/app-shell';

export default function ConfiguracoesPage() {
  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-4">
        <h1 className="font-headline text-3xl font-bold text-foreground">
          Configurações
        </h1>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">
            Página de configurações em construção.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
