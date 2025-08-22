
import type { Purchase } from "@/lib/types";
import { format } from 'date-fns';
import { useAppSettings } from "@/context/app-settings-context";

interface PurchaseReceiptProps {
    purchase: Purchase;
}

export function PurchaseReceipt({ purchase }: PurchaseReceiptProps) {
    const { appName, logoUrl } = useAppSettings();

    return (
        <div id="print-receipt" className="p-2 bg-white text-black">
            <div className="mx-auto">
                <div className="text-center space-y-2 mb-4">
                    <div className="flex justify-center">
                         {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="h-16 w-auto object-contain" />
                         ) : (
                            <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 17.5l-3.5-3.5"/>
                                <path d="M12 3v10"/>
                                <path d="M12 8l3.5 3.5"/>
                                <path d="M12 3a9 9 0 00-9 9h18a9 9 0 00-9-9z"/>
                            </svg>
                         )}
                    </div>
                    <h1 className="font-bold text-lg tracking-wider">COMPROVANTE DE COMPRA</h1>
                    <p className="text-sm">{appName}</p>
                </div>

                <div className="space-y-1 mb-2 border-t border-b border-dashed border-black py-2 text-sm">
                    <p><span className="font-bold">FORNECEDOR:</span> {purchase.supplier?.name || 'Não informado'}</p>
                    <p><span className="font-bold">ITEM:</span> {purchase.itemName}</p>
                    <p><span className="font-bold">NOTA FISCAL:</span> {purchase.invoice || 'N/A'}</p>
                    <p><span className="font-bold">PARCELA:</span> {purchase.installments}</p>
                    <p><span className="font-bold">VENCIMENTO:</span> {format(purchase.paymentDate, "dd/MM/yyyy")}</p>
                </div>

                <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between font-bold text-base pt-2 border-t border-dashed border-black mt-2">
                        <span>VALOR TOTAL</span>
                        <span>{purchase.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                </div>

                <div className="text-center mt-6 text-xs">
                    <p>Status: <span className="font-bold">{purchase.status}</span></p>
                    <p>Data de Emissão: {format(new Date(), "dd/MM/yyyy HH:mm:ss")}</p>
                </div>
            </div>
        </div>
    );
}
