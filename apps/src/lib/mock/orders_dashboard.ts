// ============================================================
// orders_dashboard.ts — Adapter compatibility untuk user dashboard
// Data berasal dari orders.ts (single source of truth)
// Pertahankan shape Order lama agar komponen tidak rusak:
// - ActiveOrdersList, HistoryOrdersList, OrderCard
// ============================================================

import { mockOrders, getOrdersByCustomer, type MockOrderStatus } from './orders';

// ─── Types (compatibility lama) ──────────────────────────
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  menuName: string;
  orderDate: string;
  deliveryDate: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  type: 'active' | 'history';
  paymentStatus: import('./orders').MockPaymentStatus;
  paymentProof?: import('./orders').MockPaymentProof;
  
  // New payment fields
  paymentPlan?: import('./orders').MockPaymentPlan;
  paymentMethod?: import('./orders').MockPaymentMethod;
  paymentBreakdown?: import('./orders').MockPaymentBreakdown;
  paymentProofs?: import('./orders').MockPaymentProof[];
  codCollection?: import('./orders').MockCodCollection;

  deliveryInfo?: {
    departmentOrUnit: string | null;
    floor: string | null;
    locationNote: string | null;
    addressSummary: string | null;
  };
  userId?: string | null;
}

// ─── Helper: map status lowercase -> uppercase ────────────
function mapStatus(status: MockOrderStatus): OrderStatus {
  switch (status) {
    case 'new':
    case 'confirmed':
      return 'PENDING';
    case 'processing':
    case 'ready':
      return 'PROCESSING';
    case 'delivered':
      return 'SHIPPED';
    case 'completed':
      return 'COMPLETED';
    case 'cancelled':
      return 'CANCELLED';
    default:
      return 'PENDING';
  }
}

// ─── Helper: determine active vs history ─────────────────
function mapType(status: MockOrderStatus): 'active' | 'history' {
  return ['completed', 'cancelled'].includes(status) ? 'history' : 'active';
}

// ─── Helper: extract primary menu name ───────────────────
function extractMenuName(items: { name: string }[]): string {
  if (!items.length) return 'Pesanan Catering';
  if (items.length === 1) return items[0].name;
  return `${items[0].name} +${items.length - 1} item`;
}

// ─── Adapter: dashboardOrders dari orders.ts ─────────────
// Filter hanya order milik demo customer (user-001)
// Untuk tampilan demo, jika tidak ada filter by session, tampilkan semua
const demoOrders = mockOrders.filter(o => o.customerId === 'user-001');
const fallbackOrders = demoOrders.length > 0 ? demoOrders : mockOrders;

export const dashboardOrders: Order[] = fallbackOrders.map(o => ({
  id: o.id,
  orderNumber: o.orderNumber,
  menuName: extractMenuName(o.items),
  orderDate: o.orderDate,
  deliveryDate: o.deliveryDate,
  status: mapStatus(o.status),
  total: o.total,
  items: o.items.map(i => ({
    name: i.name,
    quantity: i.quantity,
    price: i.price
  })),
  type: mapType(o.status),
  paymentStatus: o.paymentStatus,
  paymentProof: o.paymentProof,
  paymentPlan: o.paymentPlan,
  paymentMethod: o.paymentMethod,
  paymentBreakdown: o.paymentBreakdown,
  paymentProofs: o.paymentProofs,
  codCollection: o.codCollection
}));

export function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value);
}
