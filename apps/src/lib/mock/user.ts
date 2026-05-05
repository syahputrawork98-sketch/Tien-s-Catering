export type MockUserOrderStatus =
  | 'draft'
  | 'submitted'
  | 'confirmed'
  | 'processing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export type MockUserPaymentStatus =
  | 'unpaid'
  | 'waiting_verification'
  | 'paid'
  | 'refunded';

export type MockUserOrder = {
  id: string;
  date: string;
  deliveryDate: string;
  status: MockUserOrderStatus;
  paymentStatus: MockUserPaymentStatus;
  total: number;
  address: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  notes?: string;
};

export type MockUserProfile = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  type: 'personal' | 'company' | 'institution';
  defaultAddress: string;
  joinedAt: string;
};

export type MockUserAddress = {
  id: string;
  label: string;
  recipientName: string;
  whatsapp: string;
  address: string;
  isDefault: boolean;
};

export const mockUserProfile: MockUserProfile = {
  id: 'CUS-001',
  name: 'Customer Demo',
  email: 'customer@tienscatering.test',
  whatsapp: '081234567890',
  type: 'personal',
  defaultAddress: 'Jl. Melati No. 12, Jakarta Selatan',
  joinedAt: '2026-01-10'
};

export const mockUserOrders: MockUserOrder[] = [
  {
    id: 'ORD-2026-001',
    date: '2026-05-05',
    deliveryDate: '2026-05-08',
    status: 'submitted',
    paymentStatus: 'waiting_verification',
    total: 750000,
    address: 'Jl. Melati No. 12, Jakarta Selatan',
    items: [
      { name: 'Nasi Box Ayam', quantity: 20, price: 25000 },
      { name: 'Snack Box', quantity: 10, price: 15000 }
    ],
    notes: 'Kirim sebelum jam 11 siang.'
  },
  {
    id: 'ORD-2026-002',
    date: '2026-04-28',
    deliveryDate: '2026-05-01',
    status: 'delivered',
    paymentStatus: 'paid',
    total: 300000,
    address: 'Jl. Melati No. 12, Jakarta Selatan',
    items: [
      { name: 'Snack Box', quantity: 20, price: 15000 }
    ]
  },
  {
    id: 'ORD-2026-003',
    date: '2026-04-10',
    deliveryDate: '2026-04-12',
    status: 'cancelled',
    paymentStatus: 'refunded',
    total: 450000,
    address: 'Jl. Melati No. 12, Jakarta Selatan',
    items: [
      { name: 'Nasi Box Rendang', quantity: 15, price: 30000 }
    ]
  }
];

export const mockUserAddresses: MockUserAddress[] = [
  {
    id: 'ADDR-001',
    label: 'Rumah',
    recipientName: 'Customer Demo',
    whatsapp: '081234567890',
    address: 'Jl. Melati No. 12, Jakarta Selatan',
    isDefault: true
  },
  {
    id: 'ADDR-002',
    label: 'Kantor',
    recipientName: 'Customer Demo',
    whatsapp: '081234567890',
    address: 'Jl. Sudirman Kav. 10, Jakarta Pusat',
    isDefault: false
  }
];

export function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value);
}
