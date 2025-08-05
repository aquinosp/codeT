import type { ServiceOrder } from "@/lib/types";
import { format } from 'date-fns';

interface OsReceiptProps {
    order: ServiceOrder;
}

export function OsReceipt({ order }: OsReceiptProps) {
    const subTotal = order.items.reduce((acc, item) => acc + item.total, 0);

    return (
        <div id="print-receipt" className="p-8 bg-white text-black font-mono text-sm">
            <div className="max-w-md mx-auto">
                <div className="text-center space-y-2 mb-6">
                    <div className="flex justify-center">
                        <svg className="w-16 h-16 border-4 border-black p-1" viewBox="0 0 24 24">
                          <rect width="18" height="18" x="3" y="3" rx="2" stroke="black" strokeWidth="2" fill="none" />
                          <path d="M12 7v5l3.5 3.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M9 3v-2" stroke="black" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <h1 className="font-bold text-lg tracking-wider">COMPROVANTE DE PEDIDO</h1>
                    <p>TAO BIKES LTDA</p>
                    <p>CNPJ: 40.986.949/0001-27</p>
                    <p>Telefone: (41) 0404-23002</p>
                    <h2 className="font-bold text-xl pt-2">PEDIDO {order.osNumber}</h2>
                </div>

                <div className="space-y-1 mb-4">
                    <p><span className="font-bold">CLIENTE:</span> {order.customer.name}</p>
                    <p><span className="font-bold">VENDEDOR:</span> {order.technician || 'Não informado'}</p>
                </div>

                <div className="border-t-2 border-b-2 border-dashed border-black py-2">
                    <div className="grid grid-cols-[auto,1fr,auto,auto,auto] gap-x-2 font-bold mb-2">
                        <span>COD.</span>
                        <span>DESC</span>
                        <span>QTD</span>
                        <span>VL.UNIT</span>
                        <span>VL.TOTAL</span>
                    </div>
                    {order.items.map((item) => (
                        <div key={item.id} className="grid grid-cols-[auto,1fr,auto,auto,auto] gap-x-2 items-start">
                           <span className="w-12 truncate">{item.product.code}</span>
                           <span className="break-words">{item.product.name}</span>
                           <span className="text-center">{item.quantity}x</span>
                           <span className="text-right">{item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                           <span className="text-right font-bold">{item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-4 space-y-1">
                    <div className="flex justify-between">
                        <span>Valor bruto</span>
                        <span>{subTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Desconto no pedido</span>
                        <span>{(order.discount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Desconto nos itens</span>
                        <span>{Number(0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>Acréscimo no pedido</span>
                        <span>{(order.surcharge || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2">
                        <span>LÍQUIDO TOTAL</span>
                        <span>{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <p>Volte sempre!</p>
                    <p>{format(order.createdAt, "dd/MM/yyyy HH:mm:ss")}</p>
                </div>
            </div>
        </div>
    );
}
