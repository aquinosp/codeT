
'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PeopleTable } from "./people-table"
import { ProductsTable } from "./products-table"
import { Input } from '../ui/input';

export function RegistryTabs() {
  const [activeTab, setActiveTab] = useState('people');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Tabs defaultValue="people" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
      <div className="flex justify-between items-center mb-4">
        <TabsList className="grid w-full grid-cols-2 md:w-80">
          <TabsTrigger value="people">Pessoas</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
        </TabsList>
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
      <TabsContent value="people" className="mt-0 flex-1">
        <PeopleTable searchTerm={searchTerm} />
      </TabsContent>
      <TabsContent value="products" className="mt-0 flex-1">
        <ProductsTable searchTerm={searchTerm} />
      </TabsContent>
    </Tabs>
  )
}
