"use client"

import type { ComponentProps } from "react"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { DollarSign, Users, Wrench, ShoppingCart } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  { status: "Concluído", count: 25, fill: "var(--color-concluido)" },
  { status: "Em Progresso", count: 12, fill: "var(--color-em_progresso)" },
  { status: "Aguardando", count: 8, fill: "var(--color-aguardando)" },
];

const revenueData = [
    { month: "Jan", revenue: 4200, expenses: 2000 },
    { month: "Feb", revenue: 5100, expenses: 2500 },
    { month: "Mar", revenue: 5500, expenses: 3000 },
    { month: "Apr", revenue: 4800, expenses: 2800 },
    { month: "May", revenue: 6200, expenses: 3500 },
    { month: "Jun", revenue: 7800, expenses: 4000 },
    { month: "Jul", revenue: 7100, expenses: 3800 },
    { month: "Aug", revenue: 8200, expenses: 4500 },
    { month: "Sep", revenue: 8900, expenses: 4800 },
    { month: "Oct", revenue: 9500, expenses: 5000 },
    { month: "Nov", revenue: 9100, expenses: 5200 },
    { month: "Dec", revenue: 10500, expenses: 6000 },
];

const chartConfig: ComponentProps<typeof ChartContainer>["config"] = {
    revenue: {
        label: "Receita",
        color: "hsl(var(--chart-1))",
    },
    expenses: {
        label: "Despesas",
        color: "hsl(var(--chart-2))",
    },
    count: {
        label: "OS",
    },
    concluido: {
      label: "Concluído",
      color: "hsl(var(--chart-1))"
    },
    em_progresso: {
      label: "Em Progresso",
      color: "hsl(var(--chart-2))"
    },
    aguardando: {
      label: "Aguardando",
      color: "hsl(var(--chart-5))"
    }
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
              <CardTitle>Receitas vs. Despesas</CardTitle>
              <CardDescription>Comparativo mensal de receitas e despesas</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                 <ResponsiveContainer>
                    <BarChart data={revenueData}>
                        <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        />
                        <ChartTooltip
                        content={<ChartTooltipContent indicator="dot" />}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar
                        dataKey="revenue"
                        fill="var(--color-revenue)"
                        radius={4}
                        />
                        <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke="var(--color-expenses)"
                        strokeWidth={2}
                        dot={false}
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
