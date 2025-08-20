

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OsTable } from "@/components/os/os-table"
import { OsKanbanBoard } from "@/components/os/os-kanban-board"
import { NewOsSheet } from "@/components/os/new-os-sheet"
import type { ServiceOrder } from "@/lib/types";
import { DateRangePicker } from "../ui/date-range-picker";
import type { DateRange } from "react-day-picker";

interface OsTabsProps {
  orders: ServiceOrder[];
  onTabChange: (value: string) => void;
  activeTab: string;
  onPrint: (order: ServiceOrder) => void;
  onDeliver: (order: ServiceOrder) => void;
  dateFilter?: DateRange;
  onDateFilterChange: (filter?: DateRange) => void;
}

export default function OsTabs({ orders, onTabChange, activeTab, onPrint, onDeliver, dateFilter, onDateFilterChange }: OsTabsProps) {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">
          Ordens de Serviço
        </h1>
        <div className="flex items-center gap-2">
            <NewOsSheet onPrint={onPrint} onDeliver={onDeliver} />
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Tabs 
                defaultValue="lista" 
                value={activeTab} 
                onValueChange={onTabChange} 
                className="flex-1 flex flex-col"
            >
                <TabsList className="grid w-full grid-cols-2 md:w-80">
                <TabsTrigger value="lista">Lista</TabsTrigger>
                <TabsTrigger value="kanban">Kanban</TabsTrigger>
                </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
                <DateRangePicker date={dateFilter} onDateChange={onDateFilterChange} />
            </div>
       </div>

        <Tabs 
            defaultValue="lista" 
            value={activeTab} 
            onValueChange={onTabChange} 
            className="flex-1 flex flex-col mt-4"
        >
            <TabsContent value="kanban" className="flex-1 mt-0">
                <OsKanbanBoard orders={orders} onPrint={onPrint} onDeliver={onDeliver} />
            </TabsContent>
            <TabsContent value="lista" className="mt-0">
                <OsTable orders={orders} onPrint={onPrint} onDeliver={onDeliver} />
            </TabsContent>
        </Tabs>
    </div>
  )
}
