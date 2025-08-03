"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { addDoc, collection, writeBatch } from "firebase/firestore"
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
import { Textarea } from "@/components/ui/textarea"
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
  const [csvData, setCsvData] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const title = collectionName === 'people' ? 'Importar Pessoas' : 'Importar Produtos';
  const description = collectionName === 'people' ? 'Cole os dados das pessoas no formato CSV.' : 'Cole os dados dos produtos no formato CSV.';


  const handleImport = async () => {
    setIsImporting(true);
    const lines = csvData.trim().split('\n');
    const header = lines.shift()?.trim().split(',');

    if (!header || header.join(',') !== fields.join(',')) {
        toast({
            title: "Erro no Cabeçalho",
            description: `O cabeçalho do CSV deve ser exatamente: ${fields.join(',')}`,
            variant: "destructive"
        });
        setIsImporting(false);
        return;
    }

    const batch = writeBatch(db);
    let errorCount = 0;
    const errorMessages: string[] = [];

    lines.forEach((line, index) => {
        const values = line.trim().split(',');
        const docData: { [key: string]: any } = {};

        fields.forEach((field, i) => {
            docData[field] = values[i]?.trim() || '';
        });

        // Validations
        const missingFields = requiredFields.filter(f => !docData[f]);
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
            }
        }
        
        for (const field in enumFields) {
            if (docData[field] && !enumFields[field].includes(docData[field])) {
                errorCount++;
                errorMessages.push(`Linha ${index + 2}: Valor inválido para ${field}. Use um dos: ${enumFields[field].join(', ')}`);
                return;
            }
        }

        const docRef = doc(collection(db, collectionName));
        batch.set(docRef, docData);
    });

    if (errorCount > 0) {
        toast({
            title: `Encontrados ${errorCount} erros no CSV`,
            description: errorMessages.slice(0, 3).join(' | '), // Show first 3 errors
            variant: "destructive"
        });
        setIsImporting(false);
        return;
    }

    try {
      await batch.commit();
      toast({
        title: "Importação Concluída!",
        description: `${lines.length} registros foram importados com sucesso.`
      })
      setCsvData("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error committing batch: ", error);
      toast({ title: "Erro na Importação", description: "Ocorreu um erro ao salvar os dados.", variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
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
              <AlertDescription className="text-xs font-mono bg-muted p-2 rounded-md">
                {fields.join(',')}
              </AlertDescription>
           </Alert>
           <div className="grid gap-2 flex-1">
            <Label htmlFor="csvData">Dados em CSV</Label>
            <Textarea
                id="csvData"
                placeholder="Cole o conteúdo do seu arquivo CSV aqui..."
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                className="flex-1"
            />
           </div>
        </div>
        <SheetFooter className="mt-auto">
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
          <Button onClick={handleImport} disabled={isImporting || !csvData}>
            {isImporting ? "Importando..." : "Importar Dados"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
