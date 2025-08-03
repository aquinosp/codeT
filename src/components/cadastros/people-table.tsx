"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockPeople } from "@/lib/data"
import { Badge } from "../ui/badge"
import { NewPersonSheet } from "./new-person-sheet"
import { Person } from "@/lib/types"
import { Button } from "../ui/button"
import { Upload } from "lucide-react"

const getBadgeVariant = (type: Person['type']) => {
  switch (type) {
    case 'Cliente':
      return 'secondary'
    case 'Fornecedor':
      return 'outline'
    case 'Funcionário':
      return 'default'
    default:
      return 'default'
  }
}

export function PeopleTable() {
  return (
    <div className="space-y-4">
        <div className="flex items-center justify-end gap-2">
            <Button variant="outline">
                <Upload className="-ml-1 h-4 w-4" />
                Importar em massa
            </Button>
            <NewPersonSheet />
        </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>CPF/CNPJ</TableHead>
              <TableHead>Tipo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPeople.map((person) => (
              <TableRow key={person.id}>
                <TableCell className="font-medium">{person.name}</TableCell>
                <TableCell>{person.phone}</TableCell>
                <TableCell>{person.email}</TableCell>
                <TableCell>{person.cpfCnpj}</TableCell>
                <TableCell>
                    <Badge variant={getBadgeVariant(person.type)}>{person.type}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
