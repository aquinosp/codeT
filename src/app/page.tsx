
import { collection, getDocs, query, Timestamp, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ServiceOrderDocument, Purchase, Person } from "@/lib/types"

import AppShell from "@/components/app-shell"
import { DashboardCharts, type Period } from "@/components/dashboard/dashboard-charts"

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
  const purchases = purchasesSnapshot.docs.map(doc => ({ ...doc.data() as Purchase, id: doc.id }));

  // Metrics
  const monthlyRevenue = serviceOrders
    .filter(o => o.status === 'Entregue')
    .reduce((acc, o) => acc + o.total, 0);

  const openOrders = serviceOrders.filter(o => o.status !== 'Entregue');
  const openServiceOrders = openOrders.length;
  const openServiceOrdersValue = openOrders.reduce((acc, o) => acc + o.total, 0);


  const newCustomers = people.filter(p => p.type === 'Cliente').length;

  const monthlyPurchases = purchases.reduce((acc, p) => acc + p.total, 0);

  // Chart Data
  const osStatusData = serviceOrders
    .filter(o => o.status !== 'Entregue')
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
            acc.push({ month, revenue: o.total });
        }
        return acc;
    }, [] as { month: string, revenue: number }[]);

  return {
    monthlyRevenue,
    openServiceOrders,
    openServiceOrdersValue,
    newCustomers,
    monthlyPurchases,
    osStatusData: osStatusData.map(d => ({...d, name: d.status})),
    revenueByMonth
  }
}

interface DashboardPageProps {
  searchParams: {
    period?: Period
  }
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const period = searchParams.period || 'month';
  const data = await getDashboardData(period);
  
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
