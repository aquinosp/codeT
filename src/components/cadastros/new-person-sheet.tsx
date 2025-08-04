"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus } from "lucide-react"
import { addDoc, collection, doc, Timestamp, updateDoc } from "firebase/firestore"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import type { Person } from "@/lib/types"

const personSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal('')),
  cpfCnpj: z.string().optional().or(z.literal('')),
  type: z.enum(["Cliente", "Fornecedor", "Funcionário"], { required_error: "Tipo é obrigatório" }),
})

interface NewPersonSheetProps {
  isEditing?: boolean;
  person?: Person;
  trigger?: React.ReactNode;
}

export function NewPersonSheet({ isEditing = false, person, trigger }: NewPersonSheetProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof personSchema>>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      type: "Cliente",
      name: "",
      phone: "",
      email: "",
      cpfCnpj: "",
    },
  })

  useEffect(() => {
    if (isEditing && person) {
      form.reset(person);
    } else {
      form.reset({
        type: "Cliente",
        name: "",
        phone: "",
        email: "",
        cpfCnpj: "",
      });
    }
  }, [isEditing, person, form, isOpen]);


  async function onSubmit(values: z.infer<typeof personSchema>) {
    try {
      if (isEditing && person) {
        const personRef = doc(db, "people", person.id);
        await updateDoc(personRef, values);
        toast({ title: "Pessoa Atualizada", description: `Os dados de ${values.name} foram atualizados.` });
      } else {
        const personData = {
          ...values,
          createdAt: Timestamp.now()
        }
        await addDoc(collection(db, "people"), personData);
        toast({ title: "Pessoa Salva", description: `A pessoa ${values.name} foi salva com sucesso.` })
      }
      form.reset()
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving document: ", error);
      toast({ title: "Erro", description: "Ocorreu um erro ao salvar a pessoa.", variant: "destructive" });
    }
  }
  
  const title = isEditing ? 'Editar Pessoa' : 'Nova Pessoa';
  const description = isEditing ? 'Atualize os dados da pessoa selecionada.' : 'Adicione um novo cliente, fornecedor ou funcionário.';


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild onClick={() => setIsOpen(true)}>
        {trigger || <Button><Plus className="-ml-1 h-4 w-4" /> Nova Pessoa</Button>}
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg w-full flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline">{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
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
                  <FormLabel>CPF/CNPJ (Opcional)</FormLabel>
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
                  <FormLabel>Email (Opcional)</FormLabel>
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
                      <SelectItem value="Funcionário">Funcionário</SelectItem>
                    </SelectContent>
                  </Select>
                <FormMessage />
              </FormItem>
            )} />
             <SheetFooter className="mt-auto pt-4">
                <SheetClose asChild>
                    <Button variant="outline">Cancelar</Button>
                </SheetClose>
                <Button type="submit">Salvar</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
