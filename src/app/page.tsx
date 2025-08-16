
'use client';

import { collection, getDocs, query, Timestamp, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ServiceOrderDocument, Purchase, Person, PurchaseDocument } from "@/lib/types"

import AppShell from "@/components/app-shell"
import { DashboardCharts, type Period } from "@/components/dashboard/dashboard-charts"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardData {
  monthlyRevenue: number;
  openServiceOrders: number;
  openServiceOrdersValue: number;
  newCustomers: number;
  monthlyPurchases: number;
  balance: number;
  osStatusData: { status: string; count: number; name: string; }[];
  monthlyFinancials: { month: string; revenue: number; purchases: number; }[];
  dailyFinancials: { day: string; revenue: number; purchases: number; }[];
  revenueByTechnician: { technician: string; total: number; }[];
}


function getPeriodDates(period: Period) {
  const now = new Date();
  let start;
  let end = new Date();
  end.setHours(23, 59, 59, 999);

  switch (period) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
       start = new Date(now.getFullYear(), now.getMonth(), 1);
       break;
  }
   start.setHours(0, 0, 0, 0);

  return { start, end };
}


function DashboardPage() {
  const searchParams = useSearchParams();
  const period = (searchParams.get('period') as Period) || 'month';
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function getDashboardData(period: Period) {
        const { start, end } = getPeriodDates(period);

        const startTimestamp = Timestamp.fromDate(start);
        const endTimestamp = Timestamp.fromDate(end);

        // Queries
        const soQuery = query(
            collection(db, "serviceOrders"), 
            where("createdAt", ">=", startTimestamp),
            where("createdAt", "<=", endTimestamp)
        );
        const peopleQuery = query(
            collection(db, "people"),
            where("createdAt", ">=", startTimestamp),
            where("createdAt", "<=", endTimestamp)
        );
        const purchasesQuery = query(
            collection(db, "purchases"),
            where("paymentDate", ">=", startTimestamp),
            where("paymentDate", "<=", endTimestamp)
        );

        const [soSnapshot, peopleSnapshot, purchasesSnapshot] = await Promise.all([
            getDocs(soQuery),
            getDocs(peopleQuery),
            getDocs(purchasesQuery),
        ]);

        const serviceOrders = soSnapshot.docs.map(doc => ({ ...doc.data() as ServiceOrderDocument, id: doc.id }));
        const people = peopleSnapshot.docs.map(doc => ({ ...doc.data() as Person, id: doc.id }));
        const purchases = purchasesSnapshot.docs.map(doc => ({ ...doc.data() as PurchaseDocument, id: doc.id }));

        // Metrics
        const monthlyRevenue = serviceOrders
            .filter(o => o.status === 'Entregue')
            .reduce((acc, o) => acc + o.total, 0);

        const openOrders = serviceOrders.filter(o => o.status !== 'Entregue' && o.status !== 'Cancelada');
        const openServiceOrders = openOrders.length;
        const openServiceOrdersValue = openOrders.reduce((acc, o) => acc + o.total, 0);


        const newCustomers = people.filter(p => p.type === 'Cliente').length;

        const monthlyPurchases = purchases
            .filter(p => p.status === 'Pago')
            .reduce((acc, p) => acc + p.total, 0);
            
        const balance = monthlyRevenue - monthlyPurchases;

        // Chart Data
        const osStatusData = serviceOrders
            .filter(o => o.status !== 'Entregue' && o.status !== 'Cancelada' && o.status !== 'Pronta')
            .reduce((acc, o) => {
            const status = o.status;
            const existing = acc.find(item => item.status === status);
            if (existing) {
                existing.count++;
            } else {
                acc.push({ status, count: 1, fill: `var(--color-${status.replace(/ /g, '_')})` });
            }
            return acc;
            }, [] as { status: string; count: number; fill: string }[]);


        const revenueByMonth = serviceOrders
            .filter(o => o.status === 'Entregue')
            .reduce((acc, o) => {
                const month = o.createdAt.toDate().toLocaleString('default', { month: 'short' });
                const existing = acc.find(item => item.month === month);
                if(existing) {
                    existing.revenue += o.total;
                } else {
                    acc.push({ month, revenue: o.total, purchases: 0 });
                }
                return acc;
            }, [] as { month: string, revenue: number, purchases: number }[]);

        const purchasesByMonth = purchases
            .filter(p => p.status === 'Pago')
            .reduce((acc, p) => {
            const month = p.paymentDate.toDate().toLocaleString('default', { month: 'short' });
            const existing = acc.find(item => item.month === month);
            if (existing) {
                existing.purchases += p.total;
            } else {
                acc.push({ month, revenue: 0, purchases: p.total });
            }
            return acc;
            }, [] as { month: string, revenue: number, purchases: number }[]);

        const monthlyFinancials = [...revenueByMonth];

        purchasesByMonth.forEach(p => {
            const existing = monthlyFinancials.find(item => item.month === p.month);
            if (existing) {
            existing.purchases = p.purchases;
            } else {
            monthlyFinancials.push(p);
            }
        });
        
            // Daily Financials
        const dailyFinancials: { day: string, revenue: number, purchases: number }[] = [];
        if (period === 'week' || period === 'month') {
            const revenueByDay = serviceOrders
            .filter(o => o.status === 'Entregue')
            .reduce((acc, o) => {
                const day = o.createdAt.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                const existing = acc.find(item => item.day === day);
                if (existing) {
                existing.revenue += o.total;
                } else {
                acc.push({ day, revenue: o.total, purchases: 0 });
                }
                return acc;
            }, [] as { day: string, revenue: number, purchases: number }[]);

            const purchasesByDay = purchases
            .filter(p => p.status === 'Pago')
            .reduce((acc, p) => {
                const day = p.paymentDate.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                const existing = acc.find(item => item.day === day);
                if (existing) {
                existing.purchases += p.total;
                } else {
                acc.push({ day, revenue: 0, purchases: p.total });
                }
                return acc;
            }, [] as { day: string, revenue: number, purchases: number }[]);

            const allDays = new Map<string, { day: string, revenue: number, purchases: number }>();
            revenueByDay.forEach(r => allDays.set(r.day, { ...r }));
            purchasesByDay.forEach(p => {
            const existing = allDays.get(p.day);
            if (existing) {
                existing.purchases = p.purchases;
            } else {
                allDays.set(p.day, { ...p });
            }
            });
            
            dailyFinancials.push(...Array.from(allDays.values()).sort((a,b) => a.day.localeCompare(b.day)));
        }

        const revenueByTechnician = serviceOrders
            .filter(o => o.status === 'Entregue')
            .reduce((acc, o) => {
                const technician = o.technician || 'Não atribuído';
                const existing = acc.find(item => item.technician === technician);
                if (existing) {
                    existing.total += o.total;
                } else {
                    acc.push({ technician, total: o.total });
                }
                return acc;
            }, [] as { technician: string, total: number }[]);


        return {
            monthlyRevenue,
            openServiceOrders,
            openServiceOrdersValue,
            newCustomers,
            monthlyPurchases,
            balance,
            osStatusData: osStatusData.map(d => ({...d, name: d.status})),
            monthlyFinancials,
            dailyFinancials,
            revenueByTechnician,
        }
    }
    setData(null);
    getDashboardData(period).then(setData);
  }, [period]);
  
  if (!data) {
    return (
        <AppShell>
            <div className="flex flex-col gap-6 p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <Skeleton className="h-10 w-48" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-16" />
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-16" />
                    <Skeleton className="h-9 w-16" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Skeleton className="lg:col-span-4 h-80 w-full" />
                    <Skeleton className="lg:col-span-3 h-80 w-full" />
                </div>
            </div>
        </AppShell>
    );
  }
  
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold text-foreground">
            Dashboard
            </h1>
        </div>
        <DashboardCharts {...data} period={period} />
      </div>
    </AppShell>
  );
}

export default DashboardPage;
