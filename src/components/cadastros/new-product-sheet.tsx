"use client"

import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus } from "lucide-react"
import { addDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"

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
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"

const productSchema = z.object({
  code: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string(),
  type: z.enum(["Produto", "Serviço"], { required_error: "Tipo é obrigatório" }),
  costPrice: z.coerce.number().positive("Deve ser um número positivo"),
  sellPrice: z.coerce.number().positive("Deve ser um número positivo"),
  stock: z.coerce.number().int("Deve ser um número inteiro").optional(),
  minStock: z.coerce.number().int("Deve ser um número inteiro").optional(),
  unit: z.enum(["un", "kg", "L", "m"]).optional(),
}).superRefine((data, ctx) => {
    if (data.type === 'Produto') {
        if (data.stock === undefined || data.stock === null || isNaN(data.stock)) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['stock'],
                message: 'Estoque é obrigatório para produtos',
            });
        }
        if (data.minStock === undefined || data.minStock === null || isNaN(data.minStock)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['minStock'],
                message: 'Estoque mínimo é obrigatório para produtos',
            });
        }
         if (!data.unit) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['unit'],
                message: 'Unidade é obrigatória para produtos',
            });
        }
    }
});


export function NewProductSheet() {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      type: "Produto",
      code: "",
      name: "",
      description: "",
      costPrice: undefined,
      sellPrice: undefined,
      stock: undefined,
      minStock: undefined,
      unit: "un",
    },
  })
  
  const productType = useWatch({
    control: form.control,
    name: 'type',
  });


  async function onSubmit(values: z.infer<typeof productSchema>) {
    try {
      await addDoc(collection(db, "products"), values);
      toast({ title: "Item Salvo", description: `O item ${values.name} foi salvo com sucesso.` })
      form.reset()
      setIsOpen(false)
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({ title: "Erro", description: "Ocorreu um erro ao salvar o item.", variant: "destructive" });
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button onClick={() => setIsOpen(true)}><Plus className="-ml-1 h-4 w-4" /> Novo Produto/Serviço</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-2xl w-full flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline">Novo Produto ou Serviço</SheetTitle>
          <SheetDescription>
            Adicione um novo produto ou serviço ao seu inventário.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col gap-4 overflow-y-auto pr-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Item</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Produto" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Produto
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Serviço" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Serviço
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto/Serviço</FormLabel>
                  <FormControl><Input placeholder={productType === 'Produto' ? "Ex: Pneu Aro 15" : "Ex: Troca de óleo"} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="code" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Código/SKU</FormLabel>
                  <FormControl><Input placeholder={productType === 'Produto' ? "Ex: PNEU-001" : "Ex: SERV-001"} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField name="description" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição Completa</FormLabel>
                <FormControl><Textarea placeholder="Descrição detalhada do produto ou serviço..." {...field} rows={4} /></FormControl>
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
            {productType === 'Produto' && (
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
            )}
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
