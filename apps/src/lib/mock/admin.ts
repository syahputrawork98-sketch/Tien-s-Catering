// ============================================================
// admin.ts — Adapter compatibility untuk Admin dashboard
// Data user berasal dari accounts.ts
// Data metrics dan reports berasal dari reports.ts
// Settings tetap statis
// ============================================================

import { mockAccounts, type MockAccount } from './accounts';
export { mockAdminMetrics, mockAdminSalesReports } from './reports';
export type { MockAdminReportMetric, MockAdminSalesReport } from './reports';

// ─── Types ───────────────────────────────────────────────
export type MockAdminUserRole = 'USER' | 'CUSTOMER_SERVICE' | 'ADMIN';

export type MockAdminUser = {
  id: string;
  name: string;
  email: string;
  role: MockAdminUserRole;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
};

export type MockAdminSetting = {
  id: string;
  name: string;
  description: string;
  value: string;
  category: 'business' | 'notification' | 'system';
};

// ─── Adapter: mockAdminUsers dari accounts.ts ────────────
function mapStatus(a: MockAccount): MockAdminUser['status'] {
  if (a.registrationStatus === 'pending') return 'pending';
  if (a.status === 'inactive') return 'inactive';
  return 'active';
}

export const mockAdminUsers: MockAdminUser[] = mockAccounts.map((a: MockAccount) => ({
  id: a.id,
  name: a.name,
  email: a.email ?? `${a.id}@tienscatering.test`,
  role: a.role as MockAdminUserRole,
  status: mapStatus(a),
  lastLogin: a.lastLogin ?? '-'
}));

// ─── Settings (statis — belum perlu backend) ─────────────
export const mockAdminSettings: MockAdminSetting[] = [
  {
    id: 'SET-001',
    name: 'Nama Bisnis',
    description: 'Nama brand yang tampil di aplikasi publik',
    value: "Tien's Catering",
    category: 'business'
  },
  {
    id: 'SET-002',
    name: 'Nomor WhatsApp CS',
    description: 'Nomor utama untuk komunikasi customer',
    value: '081234567890',
    category: 'business'
  },
  {
    id: 'SET-003',
    name: 'Notifikasi Order Baru',
    description: 'Pengaturan notifikasi internal untuk pesanan masuk',
    value: 'Aktif',
    category: 'notification'
  },
  {
    id: 'SET-004',
    name: 'Mode Maintenance',
    description: 'Status maintenance aplikasi',
    value: 'Nonaktif',
    category: 'system'
  }
];

export function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value);
}
