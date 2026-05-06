export type MockCsOrderStatus =
  | 'new'
  | 'confirmed'
  | 'processing'
  | 'ready'
  | 'delivered'
  | 'completed'
  | 'cancelled';

import { mockCatalogItems } from './catalog';

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
  cancelledBy?: 'cs' | 'user';
  cancellationReason?: string;
  completedConfirmedByCs?: boolean;
  completedConfirmedByUser?: boolean;
  completionNote?: string;
};

export type MockCsMenu = {
  id: string;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
  stockLabel: string;
  updatedAt: string;
  activeDate?: string;
  image?: string;
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
    completedConfirmedByCs: false,
    completedConfirmedByUser: false,
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
    completedConfirmedByCs: false,
    completedConfirmedByUser: true,
    items: [
      { name: 'Nasi Box Premium', quantity: 50, price: 30000 }
    ]
  },
  {
    id: 'ORD-2026-004',
    customerName: 'Bapak Ahmad',
    whatsapp: '081222223333',
    deliveryDate: '2026-05-05',
    address: 'Komp. Harapan Jaya C1, Bekasi',
    total: 250000,
    status: 'completed',
    paymentStatus: 'paid',
    completedConfirmedByCs: true,
    completedConfirmedByUser: true,
    completionNote: 'Alhamdulillah, acara lancar katering mantap.',
    items: [
      { name: 'Nasi Kuning Special', quantity: 10, price: 25000 }
    ]
  },
  {
    id: 'ORD-2026-005',
    customerName: 'Sisca Kohl',
    whatsapp: '081344445555',
    deliveryDate: '2026-05-06',
    address: 'Pantai Indah Kapuk, Jakarta',
    total: 5000000,
    status: 'cancelled',
    paymentStatus: 'unpaid',
    cancelledBy: 'user',
    cancellationReason: 'Berubah pikiran, ingin makan steak berlapis emas.',
    items: [
      { name: 'Prasmanan Premium', quantity: 100, price: 50000 }
    ]
  },
  {
    id: 'ORD-2026-006',
    customerName: 'Kantor Pajak',
    whatsapp: '081255556666',
    deliveryDate: '2026-05-11',
    address: 'Jl. Gatot Subroto, Jakarta',
    total: 1200000,
    status: 'ready',
    paymentStatus: 'paid',
    items: [
      { name: 'Nasi Box Ayam', quantity: 40, price: 30000 }
    ]
  }
];

export const mockCsMenus: MockCsMenu[] = mockCatalogItems
  .filter(item => item.type === 'menu')
  .map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    price: item.basePrice,
    isAvailable: item.isAvailable,
    stockLabel: item.stockLabel || '',
    updatedAt: item.updatedAt,
    activeDate: item.activeDate,
    image: item.image
  }));

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
