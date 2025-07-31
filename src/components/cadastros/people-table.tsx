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

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#4285F4" d="M44,24c0-1.7-0.2-3.4-0.5-5H24v9.9h11.2c-0.5,3.2-1.9,5.9-4.2,7.8v6.4h8.2C41.5,39.1,44,32,44,24z" />
        <path fill="#34A853" d="M24,45c6.5,0,12-2.1,16-5.7l-8.2-6.4c-2.2,1.5-4.9,2.3-7.8,2.3c-6,0-11-4-12.8-9.5H2.9v6.6C6.9,39.1,14.8,45,24,45z" />
        <path fill="#FBBC05" d="M11.2,28.5c-0.3-1-0.5-2.1-0.5-3.2s0.2-2.2,0.5-3.2V15.3H2.9C1.1,18.5,0,21.7,0,25.3s1.1,6.7,2.9,9.9L11.2,28.5z" />
        <path fill="#EA4335" d="M24,10.2c3.5,0,6.6,1.2,9.1,3.6l7.3-7.3C36,2.2,30.5,0,24,0C14.8,0,6.9,5.9,2.9,15.3l8.3,6.6C13,14.2,18,10.2,24,10.2z" />
    </svg>
)


export function PeopleTable() {
  return (
    <div className="space-y-4">
        <div className="flex items-center justify-end gap-2">
            <Button variant="outline">
                <GoogleIcon className="-ml-1 h-4 w-4" />
                Importar do Google
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
