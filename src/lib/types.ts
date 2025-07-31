export type Person = {
  id: string;
  name: string;
  phone: string;
  email: string;
  cpfCnpj: string;
  type: 'Cliente' | 'Fornecedor' | 'Funcionário';
};

export type Product = {
  id: string;
  code: string;
  name:string;
  description: string;
  costPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  unit: 'un' | 'kg' | 'L' | 'm';
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
  status: 'Aguardando' | 'Em Progresso' | 'Concluído';
  createdAt: Date;
  items: ServiceOrderItem[];
  total: number;
  paymentMethod?: 'PIX' | 'Cartão' | 'Dinheiro';
};

export type Purchase = {
  id: string;
  invoice: string;
  supplier: Person;
  item: Product;
  quantity: number;
  total: number;
  paymentDate: Date;
};
