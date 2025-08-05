import type { ServiceOrder } from "@/lib/types";
import { format } from 'date-fns';

interface OsReceiptProps {
    order: ServiceOrder;
}

export function OsReceipt({ order }: OsReceiptProps) {
    const subTotal = order.items.reduce((acc, item) => acc + item.total, 0);

    return (
        <div id="print-receipt" className="p-4 bg-white text-black font-mono text-xs">
            <div className="max-w-md mx-auto">
                <div className="text-center space-y-2 mb-6">
                    <div className="flex justify-center">
                        {/* A simple bike-related SVG could go here */}
                        <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 17.5l-3.5-3.5"/>
                            <path d="M12 3v10"/>
                            <path d="M12 8l3.5 3.5"/>
                            <path d="M12 3a9 9 0 00-9 9h18a9 9 0 00-9-9z"/>
                        </svg>
                    </div>
                    <h1 className="font-bold text-base tracking-wider">COMPROVANTE DE PEDIDO</h1>
                    <p className="text-xs">TAO BIKES LTDA</p>
                    <p className="text-xs">CNPJ: 40.986.949/0001-27 | Telefone: (41) 94042-3002</p>
                    <h2 className="font-bold text-lg pt-2">PEDIDO {order.osNumber}</h2>
                </div>

                <div className="space-y-1 mb-4 border-t border-b border-dashed border-black py-2">
                    <p><span className="font-bold">CLIENTE:</span> {order.customer.name}</p>
                    <p><span className="font-bold">TELEFONE:</span> {order.customer.phone}</p>
                    <p><span className="font-bold">TÉCNICO:</span> {order.technician || 'Não informado'}</p>
                </div>

                <div className="border-b-2 border-dashed border-black pb-2">
                    <div className="grid grid-cols-[1fr,50px,60px,60px] gap-x-4 font-bold mb-1">
                        <span>DESCRIÇÃO</span>
                        <span className="text-center">QTD</span>
                        <span className="text-right">V. UNIT</span>
                        <span className="text-right">V. TOTAL</span>
                    </div>
                    {order.items.map((item) => (
                        <div key={item.id} className="grid grid-cols-[1fr,50px,60px,60px] gap-x-4 items-start">
                           <span className="break-words pr-1">{item.product.name} ({item.product.code})</span>
                           <span className="text-center">{item.quantity}x</span>
                           <span className="text-right">{item.unitPrice.toFixed(2)}</span>
                           <span className="text-right font-bold">{item.total.toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-4 space-y-1 text-xs">
                    <div className="flex justify-between">
                        <span>VALOR BRUTO</span>
                        <span>{subTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>ACRÉSCIMO</span>
                        <span>+ {(order.surcharge || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>DESCONTO</span>
                        <span>- {(order.discount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-2 border-t border-dashed border-black mt-2">
                        <span>LÍQUIDO TOTAL</span>
                        <span>{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                </div>

                 {order.description && (
                    <div className="mt-4 pt-2 border-t border-dashed border-black">
                        <p className="font-bold">OBSERVAÇÕES:</p>
                        <p>{order.description}</p>
                    </div>
                 )}


                <div className="text-center mt-8 text-[10px]">
                    <p>Volte sempre!</p>
                    <p>Data: {format(order.createdAt, "dd/MM/yyyy HH:mm:ss")}</p>
                </div>
            </div>
        </div>
    );
}
