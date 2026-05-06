// ============================================================
// cs.ts — Adapter compatibility untuk CS dashboard
// Data customer berasal dari accounts.ts
// Data order berasal dari orders.ts
// Data menu berasal dari catalog.ts
// ============================================================

import { mockAccounts, type MockAccount } from './accounts';
import { mockOrders, type MockOrder } from './orders';
import { mockCatalogItems } from './catalog';

// ─── Types ───────────────────────────────────────────────
export type MockCsOrderStatus =
  | 'new'
  | 'confirmed'
  | 'processing'
  | 'ready'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type MockCsOrder = {
  id: string;
  customerName: string;
  whatsapp: string;
  deliveryDate: string;
  address: string;
  total: number;
  status: MockCsOrderStatus;
  paymentStatus: import('./orders').MockPaymentStatus;
  paymentProof?: import('./orders').MockPaymentProof;
  
  // New payment fields
  paymentPlan?: import('./orders').MockPaymentPlan;
  paymentMethod?: import('./orders').MockPaymentMethod;
  paymentBreakdown?: import('./orders').MockPaymentBreakdown;
  paymentProofs?: import('./orders').MockPaymentProof[];
  codCollection?: import('./orders').MockCodCollection;

  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  notes?: string;
  cancelledBy?: 'cs' | 'user' | 'admin';
  cancellationReason?: string;
  completedConfirmedByCs?: boolean;
  completedConfirmedByUser?: boolean;
  completedConfirmedByAdmin?: boolean;
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
  description?: string;
};

export type MockCsCustomer = {
  id: string;
  name: string;
  type?: 'personal' | 'company' | 'institution';
  accountType?: 'personal' | 'company' | 'institution';
  requestedType?: 'personal' | 'company' | 'institution';
  whatsapp: string;
  address: string;
  totalOrders: number;
  lastOrderDate: string;
  registrationStatus: 'pending' | 'approved' | 'rejected';
  createdBy?: 'public' | 'cs' | 'admin';
  approvedBy?: 'cs' | 'admin';
  registeredAt: string;
  approvedAt?: string;
  rejectedReason?: string;
  internalNote?: string;
};

// ─── Adapter: mockCsOrders dari orders.ts ────────────────
export const mockCsOrders: MockCsOrder[] = mockOrders.map((o: MockOrder) => ({
  id: o.id,
  customerName: o.customerName,
  whatsapp: o.whatsapp,
  deliveryDate: o.deliveryDate,
  address: o.address,
  total: o.total,
  status: o.status as MockCsOrderStatus,
  paymentStatus: o.paymentStatus as any,
  items: o.items.map(i => ({
    name: i.name,
    quantity: i.quantity,
    price: i.price
  })),
  notes: o.notes,
  cancelledBy: o.cancelledBy as any,
  cancellationReason: o.cancellationReason,
  completedConfirmedByCs: o.completedConfirmedByCs,
  completedConfirmedByUser: o.completedConfirmedByUser,
  completedConfirmedByAdmin: o.completedConfirmedByAdmin,
  completionNote: o.completionNote,
  paymentProof: o.paymentProof,
  paymentPlan: o.paymentPlan,
  paymentMethod: o.paymentMethod,
  paymentBreakdown: o.paymentBreakdown,
  paymentProofs: o.paymentProofs,
  codCollection: o.codCollection
}));

// ─── Adapter: mockCsMenus dari catalog.ts ────────────────
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
    image: item.image,
    description: item.description
  }));

// ─── Adapter: mockCsCustomers dari accounts.ts ───────────
export const mockCsCustomers: MockCsCustomer[] = mockAccounts
  .filter((a: MockAccount) => a.role === 'USER')
  .map((a: MockAccount) => ({
    id: a.id,
    name: a.name,
    type: a.accountType ?? a.requestedType,
    accountType: a.accountType,
    requestedType: a.requestedType,
    whatsapp: a.whatsapp ?? '',
    address: a.address ?? '',
    totalOrders: a.totalOrders ?? 0,
    lastOrderDate: a.lastOrderDate ?? '-',
    registrationStatus: (a.registrationStatus ?? 'pending') as MockCsCustomer['registrationStatus'],
    createdBy: a.createdBy,
    approvedBy: a.approvedBy,
    registeredAt: a.registeredAt ?? '',
    approvedAt: a.approvedAt,
    rejectedReason: a.rejectedReason,
    internalNote: a.internalNote
  }));
