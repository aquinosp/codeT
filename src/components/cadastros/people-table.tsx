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
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { BulkImportSheet } from "./bulk-import-sheet"

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
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "people"), (snapshot) => {
      const data: Person[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person));
      setPeople(data);
    });
    return () => unsubscribe();
  }, []);

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {people.map((person) => (
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
