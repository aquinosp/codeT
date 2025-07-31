"use client"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"

const personSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal('')),
  cpfCnpj: z.string().min(1, "CPF/CNPJ é obrigatório"),
  type: z.enum(["Cliente", "Fornecedor"], { required_error: "Tipo é obrigatório" }),
})

export function NewPersonSheet() {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof personSchema>>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      type: "Cliente",
    },
  })

  function onSubmit(values: z.infer<typeof personSchema>) {
    console.log(values)
    toast({ title: "Pessoa Salva", description: `A pessoa ${values.name} foi salva com sucesso.` })
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button><Plus className="-ml-1 h-4 w-4" /> Nova Pessoa</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg w-full flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline">Nova Pessoa</SheetTitle>
          <SheetDescription>
            Adicione um novo cliente ou fornecedor.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col gap-4 overflow-y-auto pr-6">
              <FormField name="name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo / Razão Social</FormLabel>
                  <FormControl><Input placeholder="Ex: João da Silva" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField name="cpfCnpj" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF/CNPJ</FormLabel>
                  <FormControl><Input placeholder="Ex: 123.456.789-00" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="phone" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl><Input placeholder="(11) 98765-4321" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input placeholder="contato@exemplo.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
             <FormField name="type" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Cliente">Cliente</SelectItem>
                      <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                    </SelectContent>
                  </Select>
                <FormMessage />
              </FormItem>
            )} />
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
