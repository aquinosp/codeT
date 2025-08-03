"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"

const productSchema = z.object({
  code: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string(),
  costPrice: z.coerce.number().positive("Deve ser um número positivo"),
  sellPrice: z.coerce.number().positive("Deve ser um número positivo"),
  stock: z.coerce.number().int("Deve ser um número inteiro"),
  minStock: z.coerce.number().int("Deve ser um número inteiro"),
  unit: z.enum(["un", "kg", "L", "m"]),
})

export function NewProductSheet() {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      unit: "un",
      code: "",
      name: "",
      description: "",
      costPrice: undefined,
      sellPrice: undefined,
      stock: undefined,
      minStock: undefined,
    },
  })

  function onSubmit(values: z.infer<typeof productSchema>) {
    console.log(values)
    toast({ title: "Produto Salvo", description: `O produto ${values.name} foi salvo com sucesso.` })
    form.reset()
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button onClick={() => setIsOpen(true)}><Plus className="-ml-1 h-4 w-4" /> Novo Produto</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-2xl w-full flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline">Novo Produto</SheetTitle>
          <SheetDescription>
            Adicione um novo produto ao seu inventário.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col gap-4 overflow-y-auto pr-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl><Input placeholder="Ex: Pneu Aro 15" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="code" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Código/SKU</FormLabel>
                  <FormControl><Input placeholder="Ex: PNEU-001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField name="description" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição Completa</FormLabel>
                <FormControl><Textarea placeholder="Descrição detalhada do produto..." {...field} rows={4} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="costPrice" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço de Custo</FormLabel>
                  <FormControl><Input type="number" placeholder="R$ 0,00" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="sellPrice" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço de Venda</FormLabel>
                  <FormControl><Input type="number" placeholder="R$ 0,00" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField name="stock" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Estoque Atual</FormLabel>
                  <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="minStock" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Estoque Mínimo</FormLabel>
                  <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField name="unit" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="un">un</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="m">m</SelectItem>
                      </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </form>
        </Form>
        <SheetFooter className="mt-auto pt-4">
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)}>Salvar Produto</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
