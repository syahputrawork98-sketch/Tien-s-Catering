export type MockCsOrderStatus =
  | 'new'
  | 'confirmed'
  | 'processing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export type MockCsOrder = {
  id: string;
  customerName: string;
  whatsapp: string;
  deliveryDate: string;
  address: string;
  total: number;
  status: MockCsOrderStatus;
  paymentStatus: 'unpaid' | 'waiting_verification' | 'paid';
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  notes?: string;
};

export type MockCsMenu = {
  id: string;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
  stockLabel: string;
  updatedAt: string;
};

export type MockCsCustomer = {
  id: string;
  name: string;
  type: 'personal' | 'company' | 'institution';
  whatsapp: string;
  address: string;
  totalOrders: number;
  lastOrderDate: string;
};

export const mockCsOrders: MockCsOrder[] = [
  {
    id: 'ORD-2026-001',
    customerName: 'PT Maju Bersama',
    whatsapp: '081234567890',
    deliveryDate: '2026-05-08',
    address: 'Jl. Merdeka No. 10, Jakarta',
    total: 750000,
    status: 'new',
    paymentStatus: 'waiting_verification',
    items: [
      { name: 'Nasi Box Ayam', quantity: 20, price: 25000 },
      { name: 'Snack Box', quantity: 10, price: 15000 }
    ],
    notes: 'Kirim sebelum jam 11 siang.'
  },
  {
    id: 'ORD-2026-002',
    customerName: 'Ibu Rina',
    whatsapp: '087700001111',
    deliveryDate: '2026-05-09',
    address: 'Jl. Anggrek No. 5, Bekasi',
    total: 300000,
    status: 'confirmed',
    paymentStatus: 'paid',
    items: [
      { name: 'Snack Box', quantity: 20, price: 15000 }
    ]
  },
  {
    id: 'ORD-2026-003',
    customerName: 'Dinas Pendidikan',
    whatsapp: '081299998888',
    deliveryDate: '2026-05-10',
    address: 'Gedung Sate Lt 2, Bandung',
    total: 1500000,
    status: 'processing',
    paymentStatus: 'paid',
    items: [
      { name: 'Nasi Box Premium', quantity: 50, price: 30000 }
    ]
  }
];

export const mockCsMenus: MockCsMenu[] = [
  {
    id: 'MENU-001',
    name: 'Nasi Box Ayam',
    category: 'Nasi Box',
    price: 25000,
    isAvailable: true,
    stockLabel: 'Tersedia',
    updatedAt: '2026-05-05'
  },
  {
    id: 'MENU-002',
    name: 'Snack Box',
    category: 'Snack Box',
    price: 15000,
    isAvailable: true,
    stockLabel: 'Tersedia terbatas',
    updatedAt: '2026-05-05'
  },
  {
    id: 'MENU-003',
    name: 'Prasmanan Premium',
    category: 'Prasmanan',
    price: 65000,
    isAvailable: false,
    stockLabel: 'By request',
    updatedAt: '2026-05-04'
  },
  {
    id: 'MENU-004',
    name: 'Nasi Kuning Special',
    category: 'Nasi Box',
    price: 28000,
    isAvailable: true,
    stockLabel: 'Tersedia',
    updatedAt: '2026-05-05'
  }
];

export const mockCsCustomers: MockCsCustomer[] = [
  {
    id: 'CUS-001',
    name: 'PT Maju Bersama',
    type: 'company',
    whatsapp: '081234567890',
    address: 'Jl. Merdeka No. 10, Jakarta',
    totalOrders: 12,
    lastOrderDate: '2026-05-01'
  },
  {
    id: 'CUS-002',
    name: 'Ibu Rina',
    type: 'personal',
    whatsapp: '087700001111',
    address: 'Jl. Anggrek No. 5, Bekasi',
    totalOrders: 4,
    lastOrderDate: '2026-04-28'
  },
  {
    id: 'CUS-003',
    name: 'SMA Harapan Bangsa',
    type: 'institution',
    whatsapp: '082211112222',
    address: 'Jl. Pendidikan No. 3, Depok',
    totalOrders: 8,
    lastOrderDate: '2026-04-20'
  }
];
