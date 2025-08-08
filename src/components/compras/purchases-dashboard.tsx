
"use client"

import type { ComponentProps } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { CheckCircle, Clock, DollarSign } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

const chartConfig: ComponentProps<typeof ChartContainer>["config"] = {
    paid: {
        label: "Pago",
        color: "hsl(var(--chart-1))",
    },
    pending: {
        label: "Pendente",
        color: "hsl(var(--chart-2))",
    },
};

interface PurchasesDashboardProps {
    totalPaid: number;
    totalPending: number;
    expensesByMonth: { month: string, paid: number, pending: number }[];
}

export function PurchasesDashboard({ 
    totalPaid,
    totalPending,
    expensesByMonth,
}: PurchasesDashboardProps) {
  return (
    <>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPaid.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</div>
              <p className="text-xs text-muted-foreground">
                Total de despesas pagas no período
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
              <Clock className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPending.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</div>
              <p className="text-xs text-muted-foreground">
                Total de despesas previstas no período
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balanço</CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{(totalPaid - totalPending).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</div>
               <p className="text-xs text-muted-foreground">
                Balanço de despesas no período
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Despesas Mensais</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                 <ResponsiveContainer>
                    <BarChart data={expensesByMonth}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        />
                        <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                        <ChartTooltip
                         cursor={false}
                         content={<ChartTooltipContent indicator="dot" />}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar
                          dataKey="paid"
                          fill="var(--color-paid)"
                          radius={4}
                        />
                         <Bar
                          dataKey="pending"
                          fill="var(--color-pending)"
                          radius={4}
                        />
                    </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
    </>
  )
}
