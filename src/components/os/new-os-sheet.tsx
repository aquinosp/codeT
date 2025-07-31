"use client"

import { Plus, Trash2 } from "lucide-react"
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
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { mockPeople, mockProducts } from "@/lib/data"
import type { ServiceOrder } from "@/lib/types"

const osSchema = z.object({
  customer: z.string().min(1, "Cliente é obrigatório"),
  technician: z.string().min(1, "Técnico é obrigatório"),
  description: z.string(),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().min(1),
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
      customer: order?.customer.id,
      technician: order?.technician,
      description: order?.description,
      items: order?.items.map(i => ({ productId: i.product.id, quantity: i.quantity }))
    } : {
      technician: "Técnico Padrão",
      items: [{ productId: "", quantity: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  })

  function onSubmit(values: z.infer<typeof osSchema>) {
    console.log(values)
  }

  const title = isEditing ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço";
  const description = isEditing ? "Faça alterações na OS existente." : "Preencha os detalhes para criar uma nova OS.";

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || <Button><Plus className="-ml-1 h-4 w-4" /> Nova OS</Button>}
      </SheetTrigger>
      <SheetContent className="sm:max-w-2xl w-full flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline">{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col gap-4 overflow-y-auto pr-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalhes do serviço..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Label className="text-base font-medium">Itens do Serviço</Label>
              <div className="mt-2 space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-[1fr_100px_auto] gap-2 items-start">
                    <FormField
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um item" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockProducts.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                            <Input type="number" placeholder="Qtd." {...field} />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ productId: "", quantity: 1 })}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Item
              </Button>
            </div>
          </form>
        </Form>
        <SheetFooter className="mt-auto pt-4">
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)}>Salvar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
