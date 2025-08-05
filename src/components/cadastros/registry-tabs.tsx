
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PeopleTable } from "./people-table"
import { ProductsTable } from "./products-table"

interface RegistryTabsProps {
  searchTerm: string;
  onTabChange: (tab: string) => void;
}

export function RegistryTabs({ searchTerm, onTabChange }: RegistryTabsProps) {
  return (
    <Tabs defaultValue="people" className="flex-1 flex flex-col" onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-2 md:w-80">
        <TabsTrigger value="people">Pessoas</TabsTrigger>
        <TabsTrigger value="products">Produtos</TabsTrigger>
      </TabsList>
      <TabsContent value="people" className="mt-4">
        <PeopleTable searchTerm={searchTerm} />
      </TabsContent>
      <TabsContent value="products" className="mt-4">
        <ProductsTable searchTerm={searchTerm} />
      </TabsContent>
    </Tabs>
  )
}
