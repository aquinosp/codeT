import type { Timestamp } from "firebase/firestore";

export type Person = {
  id: string;
  name: string;
  phone: string;
  email: string;
  cpfCnpj: string;
  type: 'Cliente' | 'Fornecedor' | 'Funcionário';
  createdAt?: Timestamp;
};

export type Product = {
  id: string;
  code: string;
  name:string;
  description: string;
  barcode?: string;
  type: 'Produto' | 'Serviço';
  group: 'ACESSÓRIO' | 'PARTES' | 'PEÇAS' | 'PNEUMÁTICOS' | 'RELAÇÃO' | 'SERVIÇO' | string;
  costPrice: number;
  sellPrice: number;
  stock?: number;
  minStock?: number;
  unit?: 'un' | 'kg' | 'L' | 'm';
};

export type ServiceOrderItem = {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type ServiceOrder = {
  id: string;
  osNumber: string;
  customer: Person;
  technician: string;
  description: string;
  status: 'Pendente' | 'Em Progresso' | 'Concluído' | 'Aguardando Peças';
  createdAt: Date;
  items: ServiceOrderItem[];
  total: number;
  paymentMethod?: 'PIX' | 'Cartão' | 'Dinheiro';
  discount?: number;
  surcharge?: number;
};

export type ServiceOrderDocument = Omit<ServiceOrder, 'id' | 'customer' | 'items' | 'createdAt'> & {
  customerId: string;
  createdAt: Timestamp;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}


export type Purchase = {
  id: string;
  invoice: string;
  supplier: Person;
  item: Product;
  quantity: number;
  total: number;
  paymentDate: Date;
};