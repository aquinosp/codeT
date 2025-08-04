
import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, getDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ServiceOrder, ServiceOrderDocument } from "@/lib/types";

export function useServiceOrders() {
    const [orders, setOrders] = useState<ServiceOrder[]>([]);

    useEffect(() => {
        const q = query(collection(db, "serviceOrders"), orderBy("osNumber", "asc"));
        
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const ordersDataPromises = snapshot.docs.map(async (d) => {
                const orderData = d.data() as ServiceOrderDocument;

                if (!orderData.customerId) {
                    return null;
                }

                const customerDoc = await getDoc(doc(db, "people", orderData.customerId));
                if (!customerDoc.exists()) {
                    return null;
                }
                const customer = { id: customerDoc.id, ...customerDoc.data() };

                const itemsPromises = (orderData.items || []).map(async (item) => {
                    if (!item.productId) return null;
                    const productDoc = await getDoc(doc(db, "products", item.productId));
                    if (!productDoc.exists()) return null;
                    return {
                        id: productDoc.id,
                        product: { id: productDoc.id, ...productDoc.data() },
                        ...item
                    };
                });
                const items = (await Promise.all(itemsPromises)).filter(Boolean) as ServiceOrder['items'];

                return {
                    id: d.id,
                    ...orderData,
                    customer,
                    items,
                    createdAt: orderData.createdAt.toDate(),
                } as ServiceOrder;
            });
            const ordersData = (await Promise.all(ordersDataPromises)).filter(Boolean) as ServiceOrder[];
            setOrders(ordersData);
        });

        return () => unsubscribe();
    }, []);

    return { orders };
}
