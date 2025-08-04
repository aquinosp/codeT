import type { ComponentProps } from "react"
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { DollarSign, Users, Wrench, ShoppingCart } from "lucide-react"
import { collection, getDocs, query, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ServiceOrderDocument, Purchase, Person } from "@/lib/types"

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
    }
};

async function getDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Queries
  const soQuery = collection(db, "serviceOrders");
  const peopleQuery = collection(db, "people");
  const purchasesQuery = collection(db, "purchases");

  const [soSnapshot, peopleSnapshot, purchasesSnapshot] = await Promise.all([
    getDocs(soQuery),
    getDocs(peopleQuery),
    getDocs(purchasesQuery),
  ]);

  const serviceOrders = soSnapshot.docs.map(doc => ({ ...doc.data() as ServiceOrderDocument, id: doc.id }));
  const people = peopleSnapshot.docs.map(doc => ({ ...doc.data() as Person, id: doc.id }));
  const purchases = purchasesSnapshot.docs.map(doc => ({ ...doc.data() as Purchase, id: doc.id }));

  // Metrics
  const monthlyRevenue = serviceOrders
    .filter(o => o.status === 'Concluído' && o.createdAt.toDate() >= startOfMonth && o.createdAt.toDate() <= endOfMonth)
    .reduce((acc, o) => acc + o.total, 0);

  const openServiceOrders = serviceOrders.filter(o => o.status !== 'Concluído').length;

  const newCustomers = people.filter(p => p.type === 'Cliente' && p.createdAt && p.createdAt.toDate() >= startOfMonth && p.createdAt.toDate() <= endOfMonth).length;

  const monthlyPurchases = purchases
    .filter(p => {
        if (!p.paymentDate) return false;
        const paymentDate = new Date(p.paymentDate);
        return paymentDate >= startOfMonth && paymentDate <= endOfMonth;
    })
    .reduce((acc, p) => acc + p.total, 0);

  // Chart Data
  const osStatusData = serviceOrders
    .filter(o => o.status !== 'Concluído')
    .reduce((acc, o) => {
      const status = o.status;
      const existing = acc.find(item => item.status === status);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ status, count: 1, fill: `var(--color-${status.replace(' ', '_')})` });
      }
      return acc;
    }, [] as { status: string; count: number; fill: string }[]);


  const revenueByMonth = serviceOrders
    .filter(o => o.status === 'Concluído')
    .reduce((acc, o) => {
        const month = o.createdAt.toDate().toLocaleString('default', { month: 'short' });
        const existing = acc.find(item => item.month === month);
        if(existing) {
            existing.revenue += o.total;
        } else {
            acc.push({ month, revenue: o.total });
        }
        return acc;
    }, [] as { month: string, revenue: number }[]);

  return {
    monthlyRevenue,
    openServiceOrders,
    newCustomers,
    monthlyPurchases,
    osStatusData,
    revenueByMonth
  }
}

export default async function DashboardPage() {
  const { 
    monthlyRevenue,
    openServiceOrders,
    newCustomers,
    monthlyPurchases,
    osStatusData,
    revenueByMonth
  } = await getDashboardData();
  
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
