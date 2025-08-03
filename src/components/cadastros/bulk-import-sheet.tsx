"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { doc, collection, writeBatch } from "firebase/firestore"
import { db } from "@/lib/firebase"
import * as XLSX from 'xlsx';

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
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"

interface BulkImportSheetProps {
  collectionName: 'people' | 'products';
  fields: string[];
  requiredFields: string[];
  numericFields?: string[];
  enumFields?: Record<string, string[]>;
}

export function BulkImportSheet({ collectionName, fields, requiredFields, numericFields = [], enumFields = {} }: BulkImportSheetProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const title = collectionName === 'people' ? 'Importar Pessoas' : 'Importar Produtos/Serviços';
  const description = collectionName === 'people' ? 'Importe pessoas a partir de um arquivo Excel (.xlsx, .xls).' : 'Importe produtos e serviços a partir de um arquivo Excel (.xlsx, .xls).';


  const handleImport = async () => {
    if (!selectedFile) {
        toast({ title: "Nenhum arquivo selecionado", description: "Por favor, selecione um arquivo Excel para importar.", variant: "destructive" });
        return;
    }

    setIsImporting(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target!.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet);

            if (json.length === 0) {
                toast({ title: "Arquivo Vazio", description: "O arquivo Excel parece estar vazio.", variant: "destructive" });
                setIsImporting(false);
                return;
            }
            
            const header = Object.keys(json[0]);
            const missingHeaderFields = fields.filter(f => !header.includes(f));
            if (missingHeaderFields.length > 0) {
                 toast({
                    title: "Erro no Cabeçalho",
                    description: `As seguintes colunas estão faltando no arquivo: ${missingHeaderFields.join(',')}. O cabeçalho esperado é: ${fields.join(',')}`,
                    variant: "destructive"
                });
                setIsImporting(false);
                return;
            }

            const batch = writeBatch(db);
            let errorCount = 0;
            let importedCount = 0;
            const errorMessages: string[] = [];

            json.forEach((row, index) => {
                if (errorCount > 5) return;
                
                // Check if the row is empty
                const isRowEmpty = Object.values(row).every(value => value === null || value === '' || value === undefined);
                if (isRowEmpty) {
                    return; // Skip empty row
                }

                const docData: { [key: string]: any } = {};

                fields.forEach(field => {
                    docData[field] = row[field] ?? '';
                });

                const missingFields = requiredFields.filter(f => !docData[f] && docData[f] !== 0);
                if (missingFields.length > 0) {
                    errorCount++;
                    errorMessages.push(`Linha ${index + 2}: Campos obrigatórios faltando: ${missingFields.join(', ')}`);
                    return;
                }

                for (const field of numericFields) {
                    if (docData[field] && isNaN(Number(docData[field]))) {
                         errorCount++;
                         errorMessages.push(`Linha ${index + 2}: Campo ${field} deve ser um número.`);
                         return;
                    }
                     if (docData[field]) {
                         docData[field] = Number(docData[field]);
                    } else {
                        delete docData[field];
                    }
                }
                
                for (const field in enumFields) {
                    if (docData[field] && !enumFields[field].includes(docData[field])) {
                        errorCount++;
                        errorMessages.push(`Linha ${index + 2}: Valor inválido para ${field}. Use um dos: ${enumFields[field].join(', ')}`);
                        return;
                    }
                }
                
                if (collectionName === 'products') {
                    if (docData.type === 'Produto' && (!docData.stock || !docData.unit)) {
                        errorCount++;
                        errorMessages.push(`Linha ${index + 2}: Estoque e Unidade são obrigatórios para 'Produto'`);
                        return;
                    }
                    if(docData.type === 'Serviço') {
                        delete docData.stock;
                        delete docData.minStock;
                        delete docData.unit;
                    }
                }

                const docRef = doc(collection(db, collectionName));
                batch.set(docRef, docData);
                importedCount++;
            });

            if (errorCount > 0) {
                toast({
                    title: `Encontrados ${errorCount} erros no arquivo`,
                    description: errorMessages.slice(0, 3).join(' | '),
                    variant: "destructive"
                });
                setIsImporting(false);
                return;
            }
            
            if (importedCount === 0) {
                 toast({ title: "Nenhum dado importado", description: "O arquivo não continha dados válidos para importar.", variant: "destructive" });
                 setIsImporting(false);
                 return;
            }

            await batch.commit();
            toast({
                title: "Importação Concluída!",
                description: `${importedCount} registros foram importados com sucesso.`
            })
            setSelectedFile(null);
            setIsOpen(false);
        } catch (error) {
             console.error("Error processing file: ", error);
             toast({ title: "Erro na Importação", description: "Ocorreu um erro ao processar o arquivo.", variant: "destructive" });
        } finally {
            setIsImporting(false);
        }
    };
    reader.onerror = () => {
        toast({ title: "Erro de Leitura", description: "Não foi possível ler o arquivo selecionado.", variant: "destructive" });
        setIsImporting(false);
    }
    reader.readAsArrayBuffer(selectedFile);
  }


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
            <Upload className="-ml-1 h-4 w-4" />
            Importar em massa
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg w-full flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline">{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 flex flex-col gap-4 py-4">
           <Alert>
              <AlertTitle>Formato Esperado</AlertTitle>
              <AlertDescription className="text-xs">
                O arquivo Excel deve conter uma planilha com as seguintes colunas na primeira linha:
                <div className="font-mono bg-muted p-2 rounded-md whitespace-pre-wrap mt-2">
                    {fields.join(', ')}
                </div>
                 <p className="mt-2">Campos obrigatórios: {requiredFields.join(', ')}</p>
              </AlertDescription>
           </Alert>
           <div className="grid gap-2 flex-1">
            <Label htmlFor="excelFile">Arquivo Excel (.xlsx, .xls)</Label>
            <Input
              id="excelFile"
              type="file"
              accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              className="flex-1"
            />
           </div>
        </div>
        <SheetFooter className="mt-auto">
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
          <Button onClick={handleImport} disabled={isImporting || !selectedFile}>
            {isImporting ? "Importando..." : "Importar Dados"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
