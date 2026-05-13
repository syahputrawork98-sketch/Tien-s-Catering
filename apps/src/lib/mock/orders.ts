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

export type MockPaymentMethod =
  | 'bank_transfer'
  | 'qris'
  | 'cod_cash'
  | 'cod_transfer';

export type MockPaymentPlan =
  | 'full_prepaid'
  | 'dp_then_remaining'
  | 'cod_full';

export type MockPaymentStatus =
  | 'unpaid'
  | 'waiting_verification'
  | 'partially_paid'
  | 'cod_pending'
  | 'paid'
  | 'rejected';

export type MockPaymentProofStage =
  | 'full'
  | 'dp'
  | 'remaining';

export type MockPaymentProofStatus =
  | 'uploaded'
  | 'verified'
  | 'rejected';

export type MockPaymentVerification = {
  verifiedBy?: string;
  verifiedByRole?: 'cs' | 'admin';
  verifiedAt?: string;
  note?: string;
};

export type MockPaymentProof = {
  id: string;
  stage: MockPaymentProofStage;
  imageUrl: string;
  fileName?: string;
  uploadedAt: string;
  uploadedBy: 'user' | 'cs' | 'admin';
  amount: number;
  method: 'bank_transfer' | 'qris';
  status: MockPaymentProofStatus;

  originalSizeKb?: number;
  compressedSizeKb?: number;
  resizedWidth?: number;
  resizedHeight?: number;

  verification?: MockPaymentVerification;

  rejectedBy?: string;
  rejectedByRole?: 'cs' | 'admin';
  rejectedAt?: string;
  rejectionReason?: string;
  
  // Backward compatibility note
  note?: string;
};

export type MockPaymentBreakdown = {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;

  dpRequired: boolean;
  dpPercent?: number;
  dpAmount?: number;
};

export type MockCodCollection = {
  expectedAmount: number;
  collectedAmount?: number;
  collectedBy?: string;
  collectedByRole?: 'cs' | 'admin';
  collectedAt?: string;
  method?: 'cash' | 'transfer';
  note?: string;
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
  
  paymentMethod?: MockPaymentMethod;
  paymentPlan?: MockPaymentPlan;
  paymentBreakdown?: MockPaymentBreakdown;
  paymentProofs?: MockPaymentProof[];
  codCollection?: MockCodCollection;

  total: number;
  items: MockOrderItem[];

  notes?: string;

  cancelledBy?: 'cs' | 'user' | 'admin';
  cancellationReason?: string;

  completedConfirmedByUser?: boolean;
  completedConfirmedByCs?: boolean;
  completedConfirmedByAdmin?: boolean;
  completionNote?: string;

  // Legacy field for older components, will map from paymentProofs
  paymentProof?: MockPaymentProof;
};

export const mockOrders: MockOrder[] = [
  // 1. Order Unpaid (Full Prepaid)
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
    paymentPlan: 'full_prepaid',
    paymentMethod: 'qris',
    total: 250000,
    items: [
      { catalogItemId: 'MENU-001', name: 'Nasi Box Hemat', quantity: 10, price: 25000 }
    ],
    paymentBreakdown: {
      totalAmount: 250000,
      paidAmount: 0,
      remainingAmount: 250000,
      dpRequired: false
    }
  },

  // 2. Order Menunggu Verifikasi (Full Transfer)
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
    paymentPlan: 'full_prepaid',
    paymentMethod: 'bank_transfer',
    total: 750000,
    items: [
      { catalogItemId: 'MENU-001', name: 'Nasi Box Ayam', quantity: 20, price: 25000 },
      { catalogItemId: 'MENU-002', name: 'Snack Box', quantity: 10, price: 15000 }
    ],
    paymentBreakdown: {
      totalAmount: 750000,
      paidAmount: 0,
      remainingAmount: 750000,
      dpRequired: false
    },
    paymentProofs: [
      {
        id: 'PROOF-001',
        stage: 'full',
        imageUrl: 'https://images.unsplash.com/photo-1554224155-169641357599?auto=format&fit=crop&q=80&w=400',
        fileName: 'struk_bca_full.jpg',
        uploadedAt: '2026-05-05T14:30:00Z',
        uploadedBy: 'user',
        amount: 750000,
        method: 'bank_transfer',
        status: 'uploaded',
        note: 'Sudah transfer via BCA ya min.'
      }
    ],
    paymentProof: { // Legacy compatibility
      id: 'PROOF-001',
      stage: 'full',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-169641357599?auto=format&fit=crop&q=80&w=400',
      fileName: 'struk_bca_full.jpg',
      uploadedAt: '2026-05-05T14:30:00Z',
      uploadedBy: 'user',
      amount: 750000,
      method: 'bank_transfer',
      status: 'uploaded',
      note: 'Sudah transfer via BCA ya min.'
    }
  },

  // 3. Order DP Terverifikasi (Partially Paid)
  {
    id: 'ORD-2026-013',
    orderNumber: 'TC-2026-013',
    customerId: 'user-001',
    customerName: 'Customer Demo',
    whatsapp: '081234567890',
    orderDate: '2026-05-04',
    deliveryDate: '2026-05-15',
    address: 'Jl. Melati No. 12, Jakarta Selatan',
    status: 'confirmed',
    paymentStatus: 'partially_paid',
    paymentPlan: 'dp_then_remaining',
    paymentMethod: 'bank_transfer',
    total: 3000000,
    items: [
      { name: 'Paket Prasmanan A', quantity: 50, price: 60000 }
    ],
    paymentBreakdown: {
      totalAmount: 3000000,
      paidAmount: 900000,
      remainingAmount: 2100000,
      dpRequired: true,
      dpPercent: 30,
      dpAmount: 900000
    },
    paymentProofs: [
      {
        id: 'PROOF-002',
        stage: 'dp',
        imageUrl: 'https://images.unsplash.com/photo-1554224155-169641357599?auto=format&fit=crop&q=80&w=400',
        fileName: 'dp_transfer.png',
        uploadedAt: '2026-05-04T09:00:00Z',
        uploadedBy: 'user',
        amount: 900000,
        method: 'bank_transfer',
        status: 'verified',
        verification: {
          verifiedBy: 'CS Demo',
          verifiedByRole: 'cs',
          verifiedAt: '2026-05-04T10:30:00Z',
          note: 'DP 30% diterima.'
        }
      }
    ]
  },

  // 4. Order COD Pending
  {
    id: 'ORD-2026-014',
    orderNumber: 'TC-2026-014',
    customerId: 'user-001',
    customerName: 'Customer Demo',
    whatsapp: '081234567890',
    orderDate: '2026-05-06',
    deliveryDate: '2026-05-07',
    address: 'Jl. Melati No. 12, Jakarta Selatan',
    status: 'new',
    paymentStatus: 'cod_pending',
    paymentPlan: 'cod_full',
    paymentMethod: 'cod_cash',
    total: 150000,
    items: [
      { name: 'Nasi Box Ayam Goreng', quantity: 5, price: 30000 }
    ],
    codCollection: {
      expectedAmount: 150000
    }
  },

  // 5. Order Lunas (Full Paid)
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
    paymentPlan: 'full_prepaid',
    paymentMethod: 'bank_transfer',
    total: 1500000,
    items: [
      { name: 'Nasi Box Premium', quantity: 50, price: 30000 }
    ],
    paymentBreakdown: {
      totalAmount: 1500000,
      paidAmount: 1500000,
      remainingAmount: 0,
      dpRequired: false
    },
    paymentProofs: [
      {
        id: 'PROOF-003',
        stage: 'full',
        imageUrl: 'https://images.unsplash.com/photo-1554224155-169641357599?auto=format&fit=crop&q=80&w=400',
        fileName: 'tf_mandiri_full.png',
        uploadedAt: '2026-05-04T10:00:00Z',
        uploadedBy: 'user',
        amount: 1500000,
        method: 'bank_transfer',
        status: 'verified',
        verification: {
          verifiedBy: 'CS Demo',
          verifiedByRole: 'cs',
          verifiedAt: '2026-05-04T11:00:00Z',
          note: 'Lunas via Mandiri.'
        }
      }
    ]
  },

  // 6. Order Dibatalkan
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
