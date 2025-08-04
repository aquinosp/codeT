import { collection, getDocs, query, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ServiceOrderDocument, Purchase, Person } from "@/lib/types"

import AppShell from "@/components/app-shell"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"


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
    .filter(o => o.status === 'Entregue' && o.createdAt.toDate() >= startOfMonth && o.createdAt.toDate() <= endOfMonth)
    .reduce((acc, o) => acc + o.total, 0);

  const openServiceOrders = serviceOrders.filter(o => o.status !== 'Entregue').length;

  const newCustomers = people.filter(p => p.type === 'Cliente' && p.createdAt && p.createdAt.toDate() >= startOfMonth && p.createdAt.toDate() <= endOfMonth).length;

  const monthlyPurchases = purchases
    .filter(p => {
        if (!p.paymentDate) return false;
        const paymentDate = (p.paymentDate as unknown as Timestamp).toDate();
        return paymentDate >= startOfMonth && paymentDate <= endOfMonth;
    })
    .reduce((acc, p) => acc + p.total, 0);

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
    newCustomers,
    monthlyPurchases,
    osStatusData: osStatusData.map(d => ({...d, name: d.status})),
    revenueByMonth
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-4 sm:p-6 md:p-8">
        <h1 className="text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <DashboardCharts {...data} />
      </div>
    </AppShell>
  );
}
