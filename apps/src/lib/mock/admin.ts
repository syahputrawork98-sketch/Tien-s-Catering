export type MockAdminReportMetric = {
  label: string;
  value: string;
  change: string;
  tone: 'positive' | 'negative' | 'neutral';
};

export type MockAdminSalesReport = {
  id: string;
  period: string;
  revenue: number;
  orders: number;
  grossProfit: number;
  topMenu: string;
};

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

export const mockAdminMetrics: MockAdminReportMetric[] = [
  {
    label: 'Omzet Bulan Ini',
    value: 'Rp 42.500.000',
    change: '+18% dari bulan lalu',
    tone: 'positive'
  },
  {
    label: 'Total Order',
    value: '186',
    change: '+24 order minggu ini',
    tone: 'positive'
  },
  {
    label: 'Customer Aktif',
    value: '74',
    change: '12 customer baru',
    tone: 'positive'
  },
  {
    label: 'Order Pending',
    value: '9',
    change: 'Perlu ditindaklanjuti',
    tone: 'neutral'
  }
];

export const mockAdminSalesReports: MockAdminSalesReport[] = [
  {
    id: 'REP-001',
    period: 'Minggu 1 Mei 2026',
    revenue: 12500000,
    orders: 48,
    grossProfit: 4200000,
    topMenu: 'Nasi Box Ayam'
  },
  {
    id: 'REP-002',
    period: 'Minggu 2 Mei 2026',
    revenue: 14800000,
    orders: 56,
    grossProfit: 5100000,
    topMenu: 'Snack Box Premium'
  },
  {
    id: 'REP-003',
    period: 'Minggu 3 Mei 2026',
    revenue: 15200000,
    orders: 61,
    grossProfit: 5350000,
    topMenu: 'Prasmanan Premium'
  }
];

export const mockAdminUsers: MockAdminUser[] = [
  {
    id: 'USR-001',
    name: 'Admin Demo',
    email: 'admin@tienscatering.test',
    role: 'ADMIN',
    status: 'active',
    lastLogin: '2026-05-05 09:30'
  },
  {
    id: 'USR-002',
    name: 'CS Demo',
    email: 'cs@tienscatering.test',
    role: 'CUSTOMER_SERVICE',
    status: 'active',
    lastLogin: '2026-05-05 10:15'
  },
  {
    id: 'USR-003',
    name: 'Customer Demo',
    email: 'customer@tienscatering.test',
    role: 'USER',
    status: 'active',
    lastLogin: '2026-05-04 18:20'
  },
  {
    id: 'USR-004',
    name: 'PT Maju Bersama',
    email: 'finance@majubersama.test',
    role: 'USER',
    status: 'pending',
    lastLogin: '-'
  }
];

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
