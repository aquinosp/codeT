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
import { mockPeople, mockProducts } from "@/lib/data"
import type { ServiceOrder } from "@/lib/types"
import React from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { cn } from "@/lib/utils"

const osSchema = z.object({
  osNumber: z.string(),
  customer: z.string().min(1, "Cliente é obrigatório"),
  technician: z.string().min(1, "Técnico é obrigatório"),
  description: z.string(),
  items: z.array(z.object({
    productId: z.string().min(1, "Selecione um item"),
    description: z.string(),
    unitPrice: z.coerce.number(),
    quantity: z.coerce.number().min(1, "Min. 1"),
  })).min(1, "Adicione pelo menos um item"),
})

interface NewOsSheetProps {
  isEditing?: boolean;
  order?: ServiceOrder;
  trigger?: React.ReactNode;
}

export function NewOsSheet({ isEditing = false, order, trigger }: NewOsSheetProps) {
  const form = useForm<z.infer<typeof osSchema>>({
    resolver: zodResolver(osSchema),
    defaultValues: isEditing ? {
      osNumber: order?.osNumber,
      customer: order?.customer.id,
      technician: order?.technician,
      description: order?.description,
      items: order?.items.map(i => ({ 
        productId: i.product.id,
        description: i.product.description,
        unitPrice: i.unitPrice,
        quantity: i.quantity 
      }))
    } : {
      osNumber: "OS-NOVA",
      technician: "Técnico Padrão",
      description: "",
      items: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  })

  const watchedItems = useWatch({
    control: form.control,
    name: "items"
  });

  const totalValue = watchedItems.reduce((acc, current) => {
    const price = current.unitPrice || 0;
    const quantity = current.quantity || 0;
    return acc + (price * quantity);
  }, 0);


  const handleProductChange = (productId: string, index: number) => {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.description`, product.description);
      form.setValue(`items.${index}.unitPrice`, product.sellPrice);
    }
  }


  function onSubmit(values: z.infer<typeof osSchema>) {
    console.log(values)
    // Handle save
  }

  function onSaveAndPrint(values: z.infer<typeof osSchema>) {
    console.log(values);
    // Handle save and print
    window.print();
  }


  const title = isEditing ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço";
  const description = isEditing ? "Faça alterações na OS existente." : "Preencha os detalhes para criar uma nova ordem de serviço.";

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || <Button><Plus className="-ml-1 h-4 w-4" /> Nova OS</Button>}
      </SheetTrigger>
      <SheetContent className="sm:max-w-4xl w-full flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline">{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form className="flex-1 flex flex-col gap-6 overflow-y-auto pr-6">
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
                        <SelectItem value="Técnico Padrão">Técnico Padrão</SelectItem>
                        <SelectItem value="Júlio Chaves">Júlio Chaves</SelectItem>
                        <SelectItem value="Carlos">Carlos</SelectItem>
                        <SelectItem value="Marcos">Marcos</SelectItem>
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
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <div className="flex gap-2">
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockPeople.filter(p => p.type === 'Cliente').map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <Label className="text-base font-medium">Itens do Serviço</Label>
               {fields.length > 0 && (
                <div className="grid grid-cols-[1fr,1fr,120px,80px,auto] gap-2 text-sm font-medium text-muted-foreground px-1">
                  <span>Código</span>
                  <span>Descrição</span>
                  <span>Preço Unit.</span>
                  <span>Qtd.</span>
                </div>
              )}
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-[1fr,1fr,120px,80px,auto] gap-2 items-start">
                    <FormField
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={(value) => {
                            field.onChange(value)
                            handleProductChange(value, index)
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockProducts.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.code}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => ( <FormItem><FormControl><Input {...field} placeholder="Descrição do produto/serviço" disabled /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field }) => ( <FormItem><FormControl><Input type="number" {...field} placeholder="0" disabled /></FormControl><FormMessage /></FormItem> )} />
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
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                 <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => append({ productId: "", description: "", unitPrice: 0, quantity: 1 })}>
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

            <div className="flex justify-end items-center gap-4 mt-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">{totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
            </div>
          </form>
        </Form>
        <SheetFooter className="mt-auto pt-4">
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
           <DropdownMenu>
            <div className="flex rounded-md">
              <Button onClick={form.handleSubmit(onSubmit)} className="rounded-r-none">Salvar</Button>
              <DropdownMenuTrigger asChild>
                <Button size="icon" className="w-8 rounded-l-none border-l">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </div>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={form.handleSubmit(onSaveAndPrint)}>
                <Printer className="mr-2 h-4 w-4" />
                Salvar e Imprimir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

    