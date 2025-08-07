

"use client"

import { Plus, Edit } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format, addMonths } from "date-fns"
import { useEffect, useState } from "react"
import type { Person, Purchase } from "@/lib/types"
import { collection, onSnapshot, writeBatch, Timestamp, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"

const purchaseSchema = z.object({
  supplierId: z.string().min(1, "Fornecedor é obrigatório"),
  itemName: z.string().min(1, "Item/Descrição é obrigatório"),
  invoice: z.string().optional(),
  installments: z.coerce.number().min(1, "Pelo menos 1 parcela").default(1),
  total: z.coerce.number().min(0.01, "Valor deve ser maior que zero"),
  paymentDate: z.date({ required_error: "Data é obrigatória" }),
  status: z.enum(['Previsão', 'Pago']),
});


interface NewPurchaseSheetProps {
    isEditing?: boolean;
    purchase?: Purchase;
    trigger?: React.ReactNode;
}


export function NewPurchaseSheet({ isEditing = false, purchase, trigger }: NewPurchaseSheetProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof purchaseSchema>>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplierId: '',
      itemName: '',
      invoice: '',
      installments: 1,
      total: undefined,
      paymentDate: new Date(),
      status: 'Previsão',
    }
  });

  const isPaid = isEditing && purchase?.status === 'Pago';

  useEffect(() => {
    if (isOpen) {
        if (isEditing && purchase) {
            form.reset({
                ...purchase,
                installments: parseInt(purchase.installments) || 1,
                supplierId: purchase.supplier.id,
                invoice: purchase.invoice || '',
                status: purchase.status || 'Previsão',
                total: purchase.total || undefined,
            });
        } else {
            form.reset({
                supplierId: '',
                itemName: '',
                invoice: '',
                installments: 1,
                total: undefined,
                paymentDate: new Date(),
                status: 'Previsão',
            });
        }
    }
  }, [isOpen, isEditing, purchase, form])


  useEffect(() => {
    const unsubPeople = onSnapshot(collection(db, "people"), (snapshot) => {
      setPeople(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person)));
    });
    return () => {
      unsubPeople();
    };
  }, []);
  
  const onSubmit = async (values: z.infer<typeof purchaseSchema>) => {
    try {
        if(isEditing && purchase) {
            const purchaseRef = doc(db, 'purchases', purchase.id);
            const { installments, total, paymentDate, ...rest } = values;

            const purchaseData = {
                ...rest,
                total,
                paymentDate: Timestamp.fromDate(paymentDate),
                installments: purchase.installments,
            };
            
            await updateDoc(purchaseRef, purchaseData);
            toast({
                title: "Compra atualizada!",
                description: "A compra foi atualizada com sucesso."
            });

        } else {
            const batch = writeBatch(db);
            const { installments, total, paymentDate, ...rest } = values;
            
            const installmentValue = total / installments;

            for (let i = 0; i < installments; i++) {
                const docRef = doc(collection(db, "purchases"));
                const currentPaymentDate = addMonths(paymentDate, i);
                
                const purchaseData = {
                    ...rest,
                    total: installmentValue,
                    paymentDate: Timestamp.fromDate(currentPaymentDate),
                    installments: `${i + 1}/${installments}`,
                    status: 'Previsão' as const,
                };
                batch.set(docRef, purchaseData);
            }

            await batch.commit();

            toast({
                title: "Compra registrada!",
                description: `${installments} parcela(s) foram criadas com sucesso.`
            });
        }
        
        setIsOpen(false);

    } catch (error) {
        console.error("Error creating purchases: ", error);
        toast({
            title: "Erro ao registrar compra",
            description: "Ocorreu um erro ao tentar salvar a compra.",
            variant: "destructive",
        })
    }
  }
  
  const title = isEditing ? 'Editar Compra' : 'Registrar Nova Compra';
  const description = isEditing ? 'Atualize os dados da compra.' : 'Preencha os dados da compra para adicionar ao histórico.';


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || <Button><Plus className="-ml-1 h-4 w-4" /> Nova Compra</Button>}
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg w-full flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline">{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col gap-4 py-4 overflow-y-auto">
                <FormField
                    name="supplierId"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Fornecedor / Funcionário</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isPaid}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um fornecedor ou funcionário" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {people.filter(p => p.type === 'Fornecedor' || p.type === 'Funcionário').map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    name="itemName"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Item/Descrição</FormLabel>
                            <FormControl>
                                <Input placeholder="Descreva o item ou serviço comprado" {...field} disabled={isPaid} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    name="invoice"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nota Fiscal (Opcional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Nº da nota fiscal" {...field} disabled={isPaid} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        name="installments"
                        control={form.control}
                        render={({ field }) => (
                           <FormItem>
                             <FormLabel>Parcelas</FormLabel>
                             <FormControl>
                                <Input type="number" placeholder="1" {...field} disabled={isEditing} />
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                        )}
                    />
                    <FormField
                        name="total"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor Total (R$)</FormLabel>
                                <FormControl>
                                 <Input type="number" placeholder="R$ 0,00" {...field} value={field.value ?? ""} disabled={isPaid} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    name="paymentDate"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Data de Vencimento</FormLabel>
                            <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                    )}
                                    disabled={isPaid}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, "PPP") : <span>Selecione uma data</span>}
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                />
                            </PopoverContent>
                            </Popover>
                             <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    name="status"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isPaid}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Previsão">Previsão</SelectItem>
                                    <SelectItem value="Pago">Pago</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
              <SheetFooter className="mt-auto">
                <SheetClose asChild>
                    <Button variant="outline">Cancelar</Button>
                </SheetClose>
                {!isPaid && <Button type="submit">Salvar</Button>}
            </SheetFooter>
            </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
