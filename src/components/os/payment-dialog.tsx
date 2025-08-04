"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { ServiceOrder } from "@/lib/types"

interface PaymentDialogProps {
  order: ServiceOrder;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (method: 'PIX' | 'Cartão' | 'Dinheiro') => void;
}

export function PaymentDialog({ order, onOpenChange, onConfirm }: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'Cartão' | 'Dinheiro'>('PIX');

  const handleConfirm = () => {
    onConfirm(paymentMethod)
  }

  return (
    <AlertDialog open onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline">Registrar Entrega e Pagamento</AlertDialogTitle>
          <AlertDialogDescription>
            Selecione a forma de pagamento para a OS <span className="font-bold">{order.osNumber}</span> no valor de {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <RadioGroup defaultValue="PIX" onValueChange={(value: 'PIX' | 'Cartão' | 'Dinheiro') => setPaymentMethod(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PIX" id="pix" />
              <Label htmlFor="pix">PIX</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Cartão" id="card" />
              <Label htmlFor="card">Cartão</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Dinheiro" id="cash" />
              <Label htmlFor="cash">Dinheiro</Label>
            </div>
          </RadioGroup>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Confirmar Pagamento</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
