
"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "../ui/badge"
import { NewPersonSheet } from "./new-person-sheet"
import { Person } from "@/lib/types"
import { useEffect, useState } from "react"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { BulkImportSheet } from "./bulk-import-sheet"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

interface PeopleTableProps {
  searchTerm: string;
}

export function PeopleTable({ searchTerm }: PeopleTableProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);

  useEffect(() => {
    const q = query(collection(db, "people"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Person[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person));
      setPeople(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = people.filter((person) => {
      return (
        person.name.toLowerCase().includes(lowercasedFilter) ||
        (person.phone && person.phone.toLowerCase().includes(lowercasedFilter)) ||
        (person.email && person.email.toLowerCase().includes(lowercasedFilter)) ||
        (person.cpfCnpj && person.cpfCnpj.toLowerCase().includes(lowercasedFilter))
      );
    });
    setFilteredPeople(filtered);
  }, [searchTerm, people]);

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-end gap-2">
            <BulkImportSheet
              collectionName="people"
              fields={['name', 'phone', 'email', 'cpfCnpj', 'type']}
              requiredFields={['name', 'phone', 'type']}
              enumFields={{ 'type': ['Cliente', 'Fornecedor', 'Funcionário'] }}
             />
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
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPeople.map((person) => (
              <TableRow key={person.id}>
                <TableCell className="font-medium">{person.name}</TableCell>
                <TableCell>{person.phone}</TableCell>
                <TableCell>{person.email}</TableCell>
                <TableCell>{person.cpfCnpj}</TableCell>
                <TableCell>
                    <Badge variant={getBadgeVariant(person.type)}>{person.type}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <NewPersonSheet isEditing person={person} trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Editar</DropdownMenuItem>} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
