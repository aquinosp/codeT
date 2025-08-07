

"use client"

import type { ComponentProps } from "react"
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Cell, LabelList, CartesianGrid } from "recharts"
import { DollarSign, Users, Wrench, ShoppingCart } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

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
import { Button } from "../ui/button"

const chartConfig: ComponentProps<typeof ChartContainer>["config"] = {
    revenue: {
        label: "Receita",
        color: "hsl(var(--chart-1))",
    },
    purchases: {
        label: "Despesas",
        color: "hsl(var(--chart-2))",
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
};

export type Period = 'today' | 'week' | 'month' | 'year';

interface DashboardChartsProps {
    monthlyRevenue: number;
    openServiceOrders: number;
    openServiceOrdersValue: number;
    newCustomers: number;
    monthlyPurchases: number;
    osStatusData: { status: string; count: number, name: string }[];
    monthlyFinancials: { month: string, revenue: number, purchases: number }[];
    dailyFinancials: { day: string, revenue: number, purchases: number }[];
    period: Period;
}

const periodLabels: Record<Period, string> = {
  today: 'Hoje',
  week: 'Semana',
  month: 'Mês',
  year: 'Ano',
};

function DateFilter({ currentPeriod }: { currentPeriod: Period }) {
  const router = useRouter();
  const pathname = usePathname();

  const handlePeriodChange = (period: Period) => {
    const params = new URLSearchParams();
    params.set('period', period);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      {(['today', 'week', 'month', 'year'] as Period[]).map((period) => (
        <Button
          key={period}
          variant={currentPeriod === period ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePeriodChange(period)}
        >
          {periodLabels[period]}
        </Button>
      ))}
    </div>
  );
}


export function DashboardCharts({ 
    monthlyRevenue,
    openServiceOrders,
    openServiceOrdersValue,
    newCustomers,
    monthlyPurchases,
    osStatusData,
    monthlyFinancials,
    dailyFinancials,
    period
}: DashboardChartsProps) {
  return (
    <>
        <DateFilter currentPeriod={period} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-5 w-5 text-primary-foreground/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{monthlyRevenue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</div>
              <p className="text-xs text-primary-foreground/80">
                Total para o período selecionado
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
              <p className="text-sm font-medium text-accent-foreground/80">
                {openServiceOrdersValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
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
                No período selecionado
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compras</CardTitle>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{monthlyPurchases.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</div>
               <p className="text-xs text-muted-foreground">
                Total de despesas no período
              </p>
            </CardContent>
          </Card>
        </div>
         {(period === 'week' || period === 'month') && (
            <Card>
                <CardHeader>
                    <CardTitle>Histograma Diário</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                     <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <ResponsiveContainer>
                            <BarChart data={dailyFinancials}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="day"
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
                                    dataKey="revenue"
                                    fill="var(--color-revenue)"
                                    radius={4}
                                />
                                <Bar
                                    dataKey="purchases"
                                    fill="var(--color-purchases)"
                                    radius={4}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Visão Financeira Mensal</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                 <ResponsiveContainer>
                    <BarChart data={monthlyFinancials}>
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
                          dataKey="revenue"
                          fill="var(--color-revenue)"
                          radius={4}
                        />
                         <Bar
                          dataKey="purchases"
                          fill="var(--color-purchases)"
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
                      innerRadius={60}
                      strokeWidth={2}
                    >
                      {osStatusData.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={chartConfig[entry.name as keyof typeof chartConfig]?.color} />
                      ))}
                      <LabelList
                          dataKey="count"
                          position="outside"
                          offset={12}
                          className="fill-foreground text-sm font-medium"
                          formatter={(value: number) => value.toLocaleString()}
                      />
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
    </>
  )
}
