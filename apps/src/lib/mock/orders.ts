// ============================================================
// orders.ts — Single Source of Truth untuk semua pesanan
// Dipakai oleh: dashboard user, CS orders, admin reports
// ============================================================

export type MockOrderStatus =
  | 'new'
  | 'confirmed'
  | 'processing'
  | 'ready'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type MockPaymentStatus =
  | 'unpaid'
  | 'waiting_verification'
  | 'paid'
  | 'refunded';

export type MockPaymentProofStatus =
  | 'none'
  | 'uploaded'
  | 'verified'
  | 'rejected';

export type MockPaymentProof = {
  imageUrl: string;
  fileName?: string;
  uploadedAt: string;
  uploadedBy: 'user' | 'cs' | 'admin';
  note?: string;

  resizedWidth?: number;
  resizedHeight?: number;
  originalSizeKb?: number;
  compressedSizeKb?: number;

  status: MockPaymentProofStatus;

  verifiedBy?: string;
  verifiedByRole?: 'cs' | 'admin';
  verifiedAt?: string;
  verificationNote?: string;

  rejectedBy?: string;
  rejectedByRole?: 'cs' | 'admin';
  rejectedAt?: string;
  rejectionReason?: string;
};

export type MockOrderItem = {
  catalogItemId?: string;
  name: string;
  quantity: number;
  price: number;
};

export type MockOrder = {
  id: string;
  orderNumber: string;

  customerId: string;
  customerName: string;
  whatsapp: string;

  orderDate: string;
  deliveryDate: string;
  address: string;

  status: MockOrderStatus;
  paymentStatus: MockPaymentStatus;

  total: number;
  items: MockOrderItem[];

  notes?: string;

  cancelledBy?: 'cs' | 'user' | 'admin';
  cancellationReason?: string;

  completedConfirmedByUser?: boolean;
  completedConfirmedByCs?: boolean;
  completedConfirmedByAdmin?: boolean;
  completionNote?: string;

  paymentProof?: MockPaymentProof;
};

export const mockOrders: MockOrder[] = [
  // ─── PESANAN BARU (new) ───────────────────────────────────
  {
    id: 'ORD-2026-001',
    orderNumber: 'TC-2026-001',
    customerId: 'CUS-001',
    customerName: 'PT Maju Bersama',
    whatsapp: '081234567890',
    orderDate: '2026-05-05',
    deliveryDate: '2026-05-08',
    address: 'Jl. Merdeka No. 10, Jakarta',
    status: 'new',
    paymentStatus: 'waiting_verification',
    total: 750000,
    items: [
      { catalogItemId: 'MENU-001', name: 'Nasi Box Ayam', quantity: 20, price: 25000 },
      { catalogItemId: 'MENU-002', name: 'Snack Box', quantity: 10, price: 15000 }
    ],
    notes: 'Kirim sebelum jam 11 siang.',
    paymentProof: {
      imageUrl: 'https://images.unsplash.com/photo-1554224155-169641357599?auto=format&fit=crop&q=80&w=400',
      fileName: 'struk_bca.jpg',
      uploadedAt: '2026-05-05T14:30:00Z',
      uploadedBy: 'user',
      status: 'uploaded',
      note: 'Sudah transfer via BCA ya min.'
    }
  },

  // ─── PROSES (confirmed) ───────────────────────────────────
  {
    id: 'ORD-2026-002',
    orderNumber: 'TC-2026-002',
    customerId: 'CUS-002',
    customerName: 'Ibu Rina',
    whatsapp: '087700001111',
    orderDate: '2026-05-05',
    deliveryDate: '2026-05-09',
    address: 'Jl. Anggrek No. 5, Bekasi',
    status: 'confirmed',
    paymentStatus: 'paid',
    total: 300000,
    items: [
      { catalogItemId: 'MENU-002', name: 'Snack Box', quantity: 20, price: 15000 }
    ],
    completedConfirmedByCs: false,
    completedConfirmedByUser: false,
    completedConfirmedByAdmin: false
  },

  // ─── PROSES (processing) ──────────────────────────────────
  {
    id: 'ORD-2026-003',
    orderNumber: 'TC-2026-003',
    customerId: 'CUS-003',
    customerName: 'Dinas Pendidikan',
    whatsapp: '081299998888',
    orderDate: '2026-05-04',
    deliveryDate: '2026-05-10',
    address: 'Gedung Sate Lt 2, Bandung',
    status: 'processing',
    paymentStatus: 'paid',
    total: 1500000,
    items: [
      { name: 'Nasi Box Premium', quantity: 50, price: 30000 }
    ],
    completedConfirmedByCs: false,
    completedConfirmedByUser: true,
    completedConfirmedByAdmin: false,
    paymentProof: {
      imageUrl: 'https://images.unsplash.com/photo-1554224155-169641357599?auto=format&fit=crop&q=80&w=400',
      fileName: 'tf_mandiri.png',
      uploadedAt: '2026-05-04T10:00:00Z',
      uploadedBy: 'user',
      status: 'verified',
      verifiedBy: 'CS Demo',
      verifiedByRole: 'cs',
      verifiedAt: '2026-05-04T11:00:00Z',
      verificationNote: 'Pembayaran sudah masuk di rekening Mandiri.'
    }
  },

  // ─── PROSES READY ─────────────────────────────────────────
  {
    id: 'ORD-2026-006',
    orderNumber: 'TC-2026-006',
    customerId: 'CUS-001',
    customerName: 'Kantor Pajak',
    whatsapp: '081255556666',
    orderDate: '2026-05-05',
    deliveryDate: '2026-05-11',
    address: 'Jl. Gatot Subroto, Jakarta',
    status: 'ready',
    paymentStatus: 'paid',
    total: 1200000,
    items: [
      { catalogItemId: 'MENU-001', name: 'Nasi Box Ayam', quantity: 40, price: 30000 }
    ],
    completedConfirmedByCs: false,
    completedConfirmedByUser: false,
    completedConfirmedByAdmin: false
  },

  // ─── PROSES (processing) — user demo ──────────────────────
  {
    id: 'ORD-2026-007',
    orderNumber: 'TC-2026-007',
    customerId: 'user-001',
    customerName: 'Customer Demo',
    whatsapp: '081234567890',
    orderDate: '2026-05-05',
    deliveryDate: '2026-05-06',
    address: 'Jl. Melati No. 12, Jakarta Selatan',
    status: 'processing',
    paymentStatus: 'paid',
    total: 750000,
    items: [
      { catalogItemId: 'MENU-001', name: 'Nasi Box Ayam Bakar', quantity: 30, price: 25000 }
    ],
    completedConfirmedByCs: false,
    completedConfirmedByUser: false,
    completedConfirmedByAdmin: false
  },

  // ─── DELIVERED — user demo ────────────────────────────────
  {
    id: 'ORD-2026-008',
    orderNumber: 'TC-2026-008',
    customerId: 'user-001',
    customerName: 'Customer Demo',
    whatsapp: '081234567890',
    orderDate: '2026-05-04',
    deliveryDate: '2026-05-05',
    address: 'Jl. Melati No. 12, Jakarta Selatan',
    status: 'delivered',
    paymentStatus: 'paid',
    total: 450000,
    items: [
      { catalogItemId: 'MENU-002', name: 'Snack Box Arisan', quantity: 30, price: 15000 }
    ],
    completedConfirmedByCs: false,
    completedConfirmedByUser: false,
    completedConfirmedByAdmin: false
  },

  // ─── SELESAI (completed) ──────────────────────────────────
  {
    id: 'ORD-2026-004',
    orderNumber: 'TC-2026-004',
    customerId: 'CUS-001',
    customerName: 'Bapak Ahmad',
    whatsapp: '081222223333',
    orderDate: '2026-05-03',
    deliveryDate: '2026-05-05',
    address: 'Komp. Harapan Jaya C1, Bekasi',
    status: 'completed',
    paymentStatus: 'paid',
    total: 250000,
    items: [
      { name: 'Nasi Kuning Special', quantity: 10, price: 25000 }
    ],
    completedConfirmedByCs: true,
    completedConfirmedByUser: true,
    completedConfirmedByAdmin: false,
    completionNote: 'Alhamdulillah, acara lancar katering mantap.'
  },
  {
    id: 'ORD-2026-009',
    orderNumber: 'TC-2026-009',
    customerId: 'user-001',
    customerName: 'Customer Demo',
    whatsapp: '081234567890',
    orderDate: '2026-05-01',
    deliveryDate: '2026-05-02',
    address: 'Jl. Melati No. 12, Jakarta Selatan',
    status: 'completed',
    paymentStatus: 'paid',
    total: 15000000,
    items: [
      { name: 'Paket Wedding Bronze', quantity: 200, price: 75000 }
    ],
    completedConfirmedByCs: true,
    completedConfirmedByUser: true,
    completedConfirmedByAdmin: true,
    completionNote: 'Pesta sukses, semua tamu puas.'
  },
  {
    id: 'ORD-2026-010',
    orderNumber: 'TC-2026-010',
    customerId: 'CUS-002',
    customerName: 'Ibu Rina',
    whatsapp: '087700001111',
    orderDate: '2026-04-28',
    deliveryDate: '2026-05-01',
    address: 'Jl. Anggrek No. 5, Bekasi',
    status: 'completed',
    paymentStatus: 'paid',
    total: 300000,
    items: [
      { name: 'Snack Box', quantity: 20, price: 15000 }
    ],
    completedConfirmedByCs: true,
    completedConfirmedByUser: true,
    completedConfirmedByAdmin: false
  },

  // ─── DIBATALKAN (cancelled) ───────────────────────────────
  {
    id: 'ORD-2026-005',
    orderNumber: 'TC-2026-005',
    customerId: 'CUS-002',
    customerName: 'Sisca Kohl',
    whatsapp: '081344445555',
    orderDate: '2026-05-05',
    deliveryDate: '2026-05-06',
    address: 'Pantai Indah Kapuk, Jakarta',
    status: 'cancelled',
    paymentStatus: 'unpaid',
    total: 5000000,
    items: [
      { catalogItemId: 'MENU-003', name: 'Prasmanan Premium', quantity: 100, price: 50000 }
    ],
    cancelledBy: 'user',
    cancellationReason: 'Berubah pikiran, ingin makan steak berlapis emas.'
  },
  {
    id: 'ORD-2026-011',
    orderNumber: 'TC-2026-011',
    customerId: 'user-001',
    customerName: 'Customer Demo',
    whatsapp: '081234567890',
    orderDate: '2026-04-10',
    deliveryDate: '2026-04-12',
    address: 'Jl. Melati No. 12, Jakarta Selatan',
    status: 'cancelled',
    paymentStatus: 'refunded',
    total: 450000,
    items: [
      { name: 'Nasi Box Rendang', quantity: 15, price: 30000 }
    ],
    cancelledBy: 'user',
    cancellationReason: 'Acara dipindahkan.'
  },

  // ─── UNPAID — user demo (Tugas 1) ───────────────────────
  {
    id: 'ORD-2026-012',
    orderNumber: 'TC-2026-012',
    customerId: 'user-001',
    customerName: 'Customer Demo',
    whatsapp: '081234567890',
    orderDate: '2026-05-06',
    deliveryDate: '2026-05-08',
    address: 'Jl. Melati No. 12, Jakarta Selatan',
    status: 'new',
    paymentStatus: 'unpaid',
    total: 250000,
    items: [
      { catalogItemId: 'MENU-001', name: 'Nasi Box Hemat', quantity: 10, price: 25000 }
    ]
  }
];

// ─── Helper functions ─────────────────────────────────────────
export function getOrdersByCustomer(customerId: string): MockOrder[] {
  return mockOrders.filter(o => o.customerId === customerId);
}

export function getOrdersByStatus(status: MockOrderStatus): MockOrder[] {
  return mockOrders.filter(o => o.status === status);
}

export function getActiveOrders(): MockOrder[] {
  return mockOrders.filter(o =>
    !['completed', 'cancelled'].includes(o.status)
  );
}

export function getHistoryOrders(): MockOrder[] {
  return mockOrders.filter(o =>
    ['completed', 'cancelled'].includes(o.status)
  );
}

export function getTotalRevenue(): number {
  return mockOrders
    .filter(o => o.status === 'completed' && o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);
}

export function getTotalOrderCount(): number {
  return mockOrders.length;
}

export function getPendingOrderCount(): number {
  return mockOrders.filter(o => o.status === 'new').length;
}
