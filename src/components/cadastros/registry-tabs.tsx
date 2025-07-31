import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PeopleTable } from "./people-table"
import { ProductsTable } from "./products-table"

export function RegistryTabs() {
  return (
    <Tabs defaultValue="people" className="flex-1 flex flex-col">
      <TabsList className="grid w-full grid-cols-2 md:w-96">
        <TabsTrigger value="people">Pessoas</TabsTrigger>
        <TabsTrigger value="products">Produtos</TabsTrigger>
      </TabsList>
      <TabsContent value="people" className="mt-4">
        <PeopleTable />
      </TabsContent>
      <TabsContent value="products" className="mt-4">
        <ProductsTable />
      </TabsContent>
    </Tabs>
  )
}
