"use client"

import type { ComponentProps } from "react"
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { DollarSign, Users, Wrench, ShoppingCart } from "lucide-react"

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
    revenue: {
        label: "Receita",
        color: "hsl(var(--chart-1))",
    },
    count: {
        label: "OS",
    },
    Pendente: {
      label: "Pendente",
      color: "hsl(var(--chart-1))"
    },
    'Em Progresso': {
      label: "Em Progresso",
      color: "hsl(var(--chart-2))"
    },
    'Aguardando Peças': {
      label: "Aguardando Peças",
      color: "hsl(var(--chart-5))"
    },
    'Pronta': {
      label: "Pronta",
      color: "hsl(var(--chart-3))"
    }
};

interface DashboardChartsProps {
    monthlyRevenue: number;
    openServiceOrders: number;
    newCustomers: number;
    monthlyPurchases: number;
    osStatusData: { status: string; count: number, name: string }[];
    revenueByMonth: { month: string, revenue: number }[];
}


export function DashboardCharts({ 
    monthlyRevenue,
    openServiceOrders,
    newCustomers,
    monthlyPurchases,
    osStatusData,
    revenueByMonth
}: DashboardChartsProps) {
  return (
    <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total (Mês)</CardTitle>
              <DollarSign className="h-5 w-5 text-primary-foreground/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{monthlyRevenue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</div>
              <p className="text-xs text-primary-foreground/80">
                Total para o mês atual
              </p>
            </CardContent>
          </Card>
          <Card className="bg-accent text-accent-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">OS Abertas</CardTitle>
              <Wrench className="h-5 w-5 text-accent-foreground/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{openServiceOrders}</div>
              <p className="text-xs text-accent-foreground/80">
                Aguardando, Pendente e Em Progresso
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">+{newCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Neste mês
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compras (Mês)</CardTitle>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{monthlyPurchases.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</div>
               <p className="text-xs text-muted-foreground">
                Total de despesas com peças
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Receitas Mensais</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                 <ResponsiveContainer>
                    <BarChart data={revenueByMonth}>
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
                        <Bar
                          dataKey="revenue"
                          fill="var(--color-revenue)"
                          radius={4}
                        />
                    </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Status das Ordens de Serviço</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square h-[250px]"
              >
                <ResponsiveContainer>
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel indicator="dot" />}
                    />
                    <Pie
                      data={osStatusData}
                      dataKey="count"
                      nameKey="name"
                      innerRadius={50}
                      strokeWidth={2}
                      cy="40%"
                      paddingAngle={4}
                    />
                    <ChartLegend
                      content={<ChartLegendContent nameKey="name" />}
                      className="flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
    </>
  )
}
