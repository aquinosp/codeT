"use client"

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
import { Label } from "@/components/ui/label"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import type { Person, Product } from "@/lib/types"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"


export function NewPurchaseSheet() {
  const [people, setPeople] = useState<Person[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const unsubPeople = onSnapshot(collection(db, "people"), (snapshot) => {
      setPeople(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person)));
    });
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });
    return () => {
      unsubPeople();
      unsubProducts();
    };
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button><Plus className="-ml-1 h-4 w-4" /> Nova Compra</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg w-full">
        <SheetHeader>
          <SheetTitle className="font-headline">Registrar Nova Compra</SheetTitle>
          <SheetDescription>
            Preencha os dados da compra para adicionar ao histórico e atualizar o estoque.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="supplier">Fornecedor</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um fornecedor" />
              </SelectTrigger>
              <SelectContent>
                {people.filter(p => p.type === 'Fornecedor').map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Item</Label>
             <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Selecione um item" />
                </SelectTrigger>
                <SelectContent>
                    {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input id="quantity" type="number" placeholder="0" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="total">Total</Label>
                    <Input id="total" type="number" placeholder="R$ 0,00" />
                </div>
            </div>
           <div className="grid gap-2">
            <Label htmlFor="paymentDate">Data de Pagamento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !Date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {true ? format(new Date(), "PPP") : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
          <Button type="submit">Salvar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
