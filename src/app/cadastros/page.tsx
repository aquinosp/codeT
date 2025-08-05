
'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import AppShell from '@/components/app-shell';
import { RegistryTabs } from '@/components/cadastros/registry-tabs';
import { Input } from '@/components/ui/input';

export default function CadastrosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('people');

  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-3xl font-bold text-foreground">
            Cadastros
          </h1>
        </div>

        <div className="flex justify-between items-center">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={`Procurar em ${activeTab === 'people' ? 'Pessoas' : 'Produtos'}...`}
                    className="pl-8 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <RegistryTabs searchTerm={searchTerm} onTabChange={setActiveTab} />
      </div>
    </AppShell>
  );
}
