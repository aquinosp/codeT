

"use client"

import { Plus, Trash2, Printer, ChevronDown } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { ServiceOrder, Person, Product, ServiceOrderDocument, ServiceOrderItem } from "@/lib/types"
import React, { useEffect, useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { NewPersonSheet } from "../cadastros/new-person-sheet"
import { addDoc, collection, onSnapshot, doc, getDoc, Timestamp, updateDoc, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Combobox } from "../ui/combobox"


const osSchema = z.object({
  osNumber: z.string(),
  customer: z.string().min(1, "Cliente é obrigatório"),
  technician: z.string().min(1, "Técnico é obrigatório"),
  description: z.string(),
  items: z.array(z.object({
    productId: z.string().min(1, "Selecione um item"),
    unitPrice: z.coerce.number(),
    quantity: z.coerce.number().min(1, "Min. 1"),
  })).min(1, "Adicione pelo menos um item"),
  discount: z.coerce.number().optional(),
  surcharge: z.coerce.number().optional(),
})

interface NewOsSheetProps {
  isEditing?: boolean;
  order?: ServiceOrder;
  trigger?: React.ReactNode;
  onPrint?: (order: ServiceOrder) => void;
}

export function NewOsSheet({ isEditing = false, order, trigger, onPrint }: NewOsSheetProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const form = useForm<z.infer<typeof osSchema>>({
    resolver: zodResolver(osSchema),
    defaultValues: isEditing ? {
      osNumber: order?.osNumber,
      customer: order?.customer.id,
      technician: order?.technician,
      description: order?.description,
      items: order?.items.map(i => ({ 
        productId: i.product.id,
        unitPrice: i.unitPrice,
        quantity: i.quantity 
      })),
      discount: order?.discount || 0,
      surcharge: order?.surcharge || 0,
    } : {
      osNumber: "Carregando...",
      technician: undefined,
      description: "",
      items: [],
      discount: 0,
      surcharge: 0,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  })
  
  const fetchNewOsNumber = async () => {
    if (!isEditing) {
      const q = query(collection(db, "serviceOrders"), orderBy("createdAt", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const lastOsNumber = querySnapshot.docs[0].data().osNumber;
        const lastNumber = parseInt(lastOsNumber?.split('-')[1] || '0', 10);
        const newNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
        const newOsNumber = `OS-${newNumber.toString().padStart(4, '0')}`;
        form.setValue("osNumber", newOsNumber);
      } else {
        form.setValue("osNumber", "OS-0001");
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNewOsNumber();
      if (!isEditing && fields.length === 0) {
        append({ productId: "", unitPrice: 0, quantity: 1 });
      }
    }
  }, [isOpen, isEditing, fields.length, append, form]);


  useEffect(() => {
    const q = query(collection(db, "people"), orderBy("name", "asc"));
    const unsubPeople = onSnapshot(q, (snapshot) => {
      setPeople(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person)));
    });
    const qProducts = query(collection(db, "products"), orderBy("name", "asc"));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });
    return () => {
      unsubPeople();
      unsubProducts();
    };
  }, []);

  const watchedItems = useWatch({
    control: form.control,
    name: "items"
  });
  
  const watchedDiscount = useWatch({
    control: form.control,
    name: "discount"
  })

  const watchedSurcharge = useWatch({
    control: form.control,
    name: "surcharge"
  })

  const subTotal = watchedItems.reduce((acc, current) => {
    const price = current.unitPrice || 0;
    const quantity = current.quantity || 0;
    return acc + (price * quantity);
  }, 0);

  const totalValue = subTotal - Number(watchedDiscount || 0) + Number(watchedSurcharge || 0);

  const handleProductChange = (productId: string, index: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.unitPrice`, product.sellPrice);
    }
  }

  const buildServiceOrderForPrint = (values: z.infer<typeof osSchema>): ServiceOrder => {
    const customer = people.find(p => p.id === values.customer);
    const items: ServiceOrderItem[] = values.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
            id: product!.id,
            product: product!,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
        };
    });

    return {
        id: isEditing ? order!.id : '',
        osNumber: values.osNumber,
        customer: customer!,
        technician: values.technician,
        description: values.description,
        status: isEditing ? order!.status : 'Pendente',
        createdAt: isEditing ? order!.createdAt : new Date(),
        items,
        total: totalValue,
        discount: values.discount,
        surcharge: values.surcharge,
    };
  };

  const handleSave = async (values: z.infer<typeof osSchema>) => {
    try {
      const osData: Omit<ServiceOrderDocument, 'createdAt'> & {createdAt?: Timestamp} = {
        osNumber: values.osNumber,
        customerId: values.customer,
        technician: values.technician,
        description: values.description,
        status: isEditing ? order!.status : 'Pendente',
        total: totalValue,
        discount: values.discount,
        surcharge: values.surcharge,
        items: values.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
      };

      if (isEditing && order) {
        const orderRef = doc(db, "serviceOrders", order.id);
        await updateDoc(orderRef, osData);
      } else {
        osData.createdAt = Timestamp.now();
        osData.status = 'Pendente';
        await addDoc(collection(db, "serviceOrders"), osData);
      }

      toast({
        title: `OS ${isEditing ? 'Atualizada' : 'Salva'}!`,
        description: `A ordem de serviço ${values.osNumber} foi ${isEditing ? 'atualizada' : 'salva'} com sucesso.`,
      })
      
      const orderForPrint = buildServiceOrderForPrint(values);
      form.reset();
      setIsOpen(false);
      return orderForPrint;

    } catch (error) {
       console.error("Error saving OS: ", error);
       toast({
         title: "Erro ao salvar",
         description: "Ocorreu um erro ao salvar a Ordem de Serviço.",
         variant: "destructive"
       })
       return null;
    }
  }

  async function onSaveAndPrint(values: z.infer<typeof osSchema>) {
    const savedOrder = await handleSave(values);
    if (savedOrder && onPrint) {
        onPrint(savedOrder);
    }
  }


  const title = isEditing ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço";
  const description = isEditing ? "Faça alterações na OS existente." : "Preencha os detalhes para criar uma nova ordem de serviço.";

  const customerOptions = people
    .filter(p => p.type === 'Cliente')
    .map(p => ({ value: p.id, label: p.name }));

  const technicianOptions = people
    .filter(p => p.type === 'Funcionário')
    .map(p => ({ value: p.name, label: p.name }));

  const productOptions = products.map(p => ({ value: p.id, label: `${p.code || 'S/C'} - ${p.name}` }));

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild onClick={() => setIsOpen(true)}>
        {trigger || <Button><Plus className="-ml-1 h-4 w-4" /> Nova OS</Button>}
      </SheetTrigger>
      <SheetContent className="sm:max-w-4xl w-full flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline">{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="flex-1 flex flex-col gap-6 overflow-y-auto pr-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="osNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da OS</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="technician"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Técnico Responsável</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um técnico" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {technicianOptions.map(tech => (
                          <SelectItem key={tech.value} value={tech.value}>{tech.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customer"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Cliente</FormLabel>
                     <Combobox
                        options={customerOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Selecione um cliente"
                        searchPlaceholder="Pesquisar cliente..."
                        notFoundText={
                          <div className="flex flex-col items-center text-center p-2">
                            <p className="text-sm text-muted-foreground">Essa pessoa não está no banco de dados.</p>
                            <NewPersonSheet />
                          </div>
                        }
                      />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <Label className="text-base font-medium">Itens do Serviço</Label>
               {fields.length > 0 && (
                <div className="grid grid-cols-[2fr,80px,120px,120px,auto] gap-2 text-sm font-medium text-muted-foreground px-1">
                  <span>Item</span>
                  <span>Qtd.</span>
                  <span>Preço Unit.</span>
                  <span>Preço Total</span>
                </div>
              )}
              <div className="space-y-2">
                {fields.map((field, index) => {
                  const item = watchedItems[index];
                  if (!item) return null;
                  const total = (item.quantity || 0) * (item.unitPrice || 0);
                  return (
                  <div key={field.id} className="grid grid-cols-[2fr,80px,120px,120px,auto] gap-2 items-start">
                    <FormField
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field }) => (
                        <FormItem>
                           <Combobox
                                options={productOptions}
                                value={field.value}
                                onChange={(value) => {
                                    field.onChange(value)
                                    handleProductChange(value, index)
                                }}
                                placeholder="Selecione um item"
                                searchPlaceholder="Pesquisar item..."
                                notFoundText="Nenhum item encontrado."
                            />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                           <FormControl>
                            <Input type="number" placeholder="1" {...field} />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field }) => ( <FormItem><FormControl><Input type="number" {...field} placeholder="0" disabled /></FormControl><FormMessage /></FormItem> )} />
                    
                    <FormItem>
                        <FormControl>
                            <Input type="number" value={total.toFixed(2)} placeholder="0" disabled />
                        </FormControl>
                    </FormItem>

                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )})}
                 <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => append({ productId: "", unitPrice: 0, quantity: 1 })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Item
                </Button>
                 <FormMessage>{form.formState.errors.items?.message}</FormMessage>
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações do Pedido</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalhes sobre o serviço, peças, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between items-start gap-4 mt-auto">
              <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="surcharge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Acréscimo (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0,00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desconto (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0,00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">{totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
            </div>
             <SheetFooter className="pt-4">
              <SheetClose asChild>
                <Button variant="outline">Cancelar</Button>
              </SheetClose>
              <div className="flex">
                  <Button type="submit">Salvar</Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" size="icon" variant="default" className="w-8 rounded-l-none border-l border-primary-foreground/20">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={form.handleSubmit(onSaveAndPrint)}>
                        <Printer className="mr-2 h-4 w-4" />
                        Salvar e Imprimir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
