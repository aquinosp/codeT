import type { Person, Product, ServiceOrder, Purchase } from './types';

export const mockPeople: Person[] = [
  { id: '1', name: 'João da Silva', phone: '(11) 98765-4321', email: 'joao.silva@example.com', cpfCnpj: '123.456.789-00', type: 'Cliente' },
  { id: '2', name: 'Maria Oliveira', phone: '(21) 91234-5678', email: 'maria.oliveira@example.com', cpfCnpj: '987.654.321-00', type: 'Cliente' },
  { id: '3', name: 'Fornecedor de Peças SA', phone: '(41) 3333-4444', email: 'contato@pecas.com', cpfCnpj: '12.345.678/0001-99', type: 'Fornecedor' },
  { id: '4', name: 'Pedro Souza', phone: '(51) 99999-8888', email: 'pedro.souza@example.com', cpfCnpj: '111.222.333-44', type: 'Cliente' },
  { id: '5', name: 'Distribuidora de Óleos Ltda', phone: '(31) 2222-1111', email: 'vendas@oleos.com', cpfCnpj: '87.654.321/0001-00', type: 'Fornecedor' },
  { id: '6', name: 'Técnico Padrão', phone: '(11) 99999-9999', email: 'tecnico@erptao.com', cpfCnpj: '111.111.111-11', type: 'Funcionário' },
];

export const mockProducts: Product[] = [
  { id: 'p1', code: 'PNEU-001', name: 'Pneu Aro 15', description: 'Pneu radial para carros de passeio.', costPrice: 250, sellPrice: 400, stock: 50, minStock: 10, unit: 'un' },
  { id: 'p2', code: 'OLEO-5W30', name: 'Óleo 5W30 Sintético', description: 'Óleo de motor sintético 5W30.', costPrice: 45, sellPrice: 80, stock: 100, minStock: 20, unit: 'L' },
  { id: 'p3', code: 'FILTRO-AR', name: 'Filtro de Ar Universal', description: 'Filtro de ar para motores a combustão.', costPrice: 20, sellPrice: 45, stock: 80, minStock: 30, unit: 'un' },
  { id: 'p4', code: 'PAST-FREIO', name: 'Pastilha de Freio Cerâmica', description: 'Jogo de pastilhas de freio dianteiras de cerâmica.', costPrice: 90, sellPrice: 180, stock: 40, minStock: 15, unit: 'un' },
];

export const mockServiceOrders: ServiceOrder[] = [
  {
    id: 'os1',
    osNumber: 'OS-001',
    customer: mockPeople[0],
    technician: 'Carlos',
    description: 'Troca de pneus e alinhamento.',
    status: 'Concluído',
    createdAt: new Date(2023, 10, 1),
    items: [
      { id: 'i1', product: mockProducts[0], quantity: 4, unitPrice: 400, total: 1600 },
    ],
    total: 1600,
    paymentMethod: 'Cartão',
  },
  {
    id: 'os2',
    osNumber: 'OS-002',
    customer: mockPeople[1],
    technician: 'Marcos',
    description: 'Revisão de 10.000km.',
    status: 'Em Progresso',
    createdAt: new Date(2023, 10, 20),
    items: [
      { id: 'i2', product: mockProducts[1], quantity: 4, unitPrice: 80, total: 320 },
      { id: 'i3', product: mockProducts[2], quantity: 1, unitPrice: 45, total: 45 },
    ],
    total: 365,
  },
  {
    id: 'os3',
    osNumber: 'OS-003',
    customer: mockPeople[3],
    technician: 'Carlos',
    description: 'Troca de pastilhas de freio.',
    status: 'Aguardando',
    createdAt: new Date(2023, 10, 22),
    items: [
      { id: 'i4', product: mockProducts[3], quantity: 1, unitPrice: 180, total: 180 },
    ],
    total: 180,
  },
];

export const mockPurchases: Purchase[] = [
  { id: 'c1', invoice: 'NF-1020', supplier: mockPeople[2], item: mockProducts[0], quantity: 20, total: 5000, paymentDate: new Date(2023, 9, 15) },
  { id: 'c2', invoice: 'NF-1021', supplier: mockPeople[4], item: mockProducts[1], quantity: 50, total: 2250, paymentDate: new Date(2023, 9, 18) },
  { id: 'c3', invoice: 'NF-1022', supplier: mockPeople[2], item: mockProducts[3], quantity: 30, total: 2700, paymentDate: new Date(2023, 10, 5) },
];
