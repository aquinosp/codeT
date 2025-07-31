"use client"

import type { ComponentProps } from "react"
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer } from "recharts"
import { BarChart as BarChartIcon, DollarSign, Users, Wrench } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  { status: "Concluído", count: 25, fill: "hsl(var(--primary))" },
  { status: "Em Progresso", count: 12, fill: "hsl(var(--accent))" },
  { status: "Aguardando", count: 8, fill: "hsl(var(--secondary))" },
];

const revenueData = [
  { service: "Troca de Pneu", revenue: 2500 },
  { service: "Revisão Completa", revenue: 7800 },
  { service: "Troca de Óleo", revenue: 3200 },
  { service: "Alinhamento", revenue: 4100 },
  { service: "Freios", revenue: 5600 },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-8 p-4 sm:p-6 md:p-8">
        <h1 className="font-headline text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total (Mês)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 45.231,89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% em relação ao mês passado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">OS Abertas</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">20</div>
              <p className="text-xs text-muted-foreground">
                Aguardando e Em Progresso
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12</div>
              <p className="text-xs text-muted-foreground">
                Neste mês
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compras (Mês)</CardTitle>
              <BarChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 5.760,40</div>
               <p className="text-xs text-muted-foreground">
                Total de despesas com peças
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="font-headline">Receita por Serviço</CardTitle>
              <CardDescription>Análise dos serviços mais rentáveis do mês.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={{}} className="h-[300px] w-full">
                <ResponsiveContainer>
                  <BarChart data={revenueData} accessibilityLayer>
                    <ChartTooltip
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="font-headline">Status das Ordens de Serviço</CardTitle>
              <CardDescription>Distribuição de OS concluídas vs. pendentes.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ChartContainer
                config={{
                  count: {
                    label: "OS",
                  },
                }}
                className="mx-auto aspect-square h-[250px]"
              >
                <ResponsiveContainer>
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={osData}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={60}
                      strokeWidth={5}
                    />
                    <ChartLegend
                      content={<ChartLegendContent nameKey="status" />}
                      className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
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
