import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OsTable } from "@/components/os/os-table"
import { OsKanbanBoard } from "@/components/os/os-kanban-board"
import { NewOsSheet } from "@/components/os/new-os-sheet"

export default function OsTabs() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">
          Ordens de Serviço
        </h1>
        <NewOsSheet />
      </div>
      <Tabs defaultValue="lista" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 md:w-80">
          <TabsTrigger value="lista">Lista</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
        </TabsList>
        <TabsContent value="kanban" className="flex-1 mt-4">
          <OsKanbanBoard />
        </TabsContent>
        <TabsContent value="lista" className="mt-4">
          <OsTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
