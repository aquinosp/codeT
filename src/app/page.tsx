"use client"

import type { ComponentProps } from "react"
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer } from "recharts"
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
import AppShell from "@/components/app-shell"

const osData = [
  { status: "Concluído", count: 25, fill: "var(--color-chart-1)" },
  { status: "Em Progresso", count: 12, fill: "var(--color-chart-2)" },
  { status: "Aguardando", count: 8, fill: "var(--color-chart-5)" },
];

const revenueData = [
    { month: "Jan", revenue: 4200 },
    { month: "Feb", revenue: 5100 },
    { month: "Mar", revenue: 5500 },
    { month: "Apr", revenue: 4800 },
    { month: "May", revenue: 6200 },
    { month: "Jun", revenue: 7800 },
    { month: "Jul", revenue: 7100 },
    { month: "Aug", revenue: 8200 },
    { month: "Sep", revenue: 8900 },
    { month: "Oct", revenue: 9500 },
    { month: "Nov", revenue: 9100 },
    { month: "Dec", revenue: 10500 },
];

const chartConfig: ComponentProps<typeof ChartContainer>["config"] = {
    revenue: {
        label: "Receita",
        color: "hsl(var(--primary))",
    },
    count: {
        label: "OS",
    },
};

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-4 sm:p-6 md:p-8">
        <h1 className="text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total (Mês)</CardTitle>
              <DollarSign className="h-5 w-5 text-primary-foreground/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R$ 45.231,89</div>
              <p className="text-xs text-primary-foreground/80">
                +20.1% em relação ao mês passado
              </p>
            </CardContent>
          </Card>
          <Card className="bg-accent text-accent-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">OS Abertas</CardTitle>
              <Wrench className="h-5 w-5 text-accent-foreground/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">20</div>
              <p className="text-xs text-accent-foreground/80">
                Aguardando e Em Progresso
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">+12</div>
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
              <div className="text-3xl font-bold">R$ 5.760,40</div>
               <p className="text-xs text-muted-foreground">
                Total de despesas com peças
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Receita por Serviço</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer>
                  <BarChart data={revenueData} accessibilityLayer>
                     <ChartTooltip
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
                config={{
                  count: {
                    label: "OS",
                  },
                  Concluído: { label: "Concluído", color: "hsl(var(--chart-1))" },
                  "Em Progresso": { label: "Em Progresso", color: "hsl(var(--chart-2))" },
                  Aguardando: { label: "Aguardando", color: "hsl(var(--chart-5))" },
                }}
                className="mx-auto aspect-square h-[250px]"
              >
                <ResponsiveContainer>
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel indicator="dot" />}
                    />
                    <Pie
                      data={osData}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={50}
                      strokeWidth={2}
                      cy="40%"
                      paddingAngle={4}
                    />
                    <ChartLegend
                      content={<ChartLegendContent nameKey="status" />}
                      className="flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
