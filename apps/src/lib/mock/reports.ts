// ============================================================
// reports.ts — Derived data untuk admin reports
// Data dihitung dari mockOrders dan mockAccounts, bukan hardcode
// ============================================================

import { mockOrders, getTotalRevenue, getTotalOrderCount, getPendingOrderCount, type MockOrder } from './orders';
import { mockAccounts } from './accounts';

// ─── Helper: format rupiah ─────────────────────────────────
function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value);
}

// ─── Helper: Active Customers (approved users with orders) ─
function getActiveCustomerCount(): number {
  return mockAccounts.filter(
    a => a.role === 'USER' && a.registrationStatus === 'approved' && (a.totalOrders ?? 0) > 0
  ).length;
}

// ─── Helper: Get top menu name from completed orders ────────
function getTopMenu(): string {
  const freq: Record<string, number> = {};
  mockOrders
    .filter(o => o.status === 'completed')
    .forEach(o => o.items.forEach(i => {
      freq[i.name] = (freq[i.name] ?? 0) + i.quantity;
    }));
  let top = '';
  let max = 0;
  for (const [name, count] of Object.entries(freq)) {
    if (count > max) { max = count; top = name; }
  }
  return top || 'Nasi Box Ayam';
}

// ─── Helper: Group orders by week ─────────────────────────
function groupOrdersByWeek(orders: MockOrder[]): Record<string, MockOrder[]> {
  const groups: Record<string, MockOrder[]> = {};
  orders.forEach(o => {
    const date = new Date(o.orderDate);
    const week = Math.ceil(date.getDate() / 7);
    const monthYear = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    const key = `Minggu ${week} ${monthYear}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(o);
  });
  return groups;
}

// ─── Exported Types (compatibility dengan admin.ts) ─────────
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

// ─── Derived Metrics ──────────────────────────────────────
export const derivedAdminMetrics: MockAdminReportMetric[] = [
  {
    label: 'Omzet Bulan Ini',
    value: formatRupiah(getTotalRevenue()),
    change: '+18% dari bulan lalu',
    tone: 'positive'
  },
  {
    label: 'Total Order',
    value: String(getTotalOrderCount()),
    change: `+${Math.max(1, Math.floor(getTotalOrderCount() * 0.13))} order minggu ini`,
    tone: 'positive'
  },
  {
    label: 'Customer Aktif',
    value: String(getActiveCustomerCount()),
    change: `${mockAccounts.filter(a => a.registrationStatus === 'pending').length} customer baru menunggu`,
    tone: 'positive'
  },
  {
    label: 'Order Pending',
    value: String(getPendingOrderCount()),
    change: 'Perlu ditindaklanjuti',
    tone: getPendingOrderCount() > 0 ? 'neutral' : 'positive'
  }
];

// ─── Derived Weekly Sales Reports ────────────────────────
const weeklyGroups = groupOrdersByWeek(
  mockOrders.filter(o => o.status === 'completed')
);

export const derivedAdminSalesReports: MockAdminSalesReport[] = Object.entries(weeklyGroups)
  .map(([period, orders], idx) => {
    const revenue = orders.reduce((sum, o) => sum + o.total, 0);
    return {
      id: `REP-${String(idx + 1).padStart(3, '0')}`,
      period,
      revenue,
      orders: orders.length,
      grossProfit: Math.round(revenue * 0.33),
      topMenu: getTopMenu()
    };
  });

// Fallback statis jika tidak ada order completed yang cukup
export const staticSalesReports: MockAdminSalesReport[] = [
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

// Ekspor utama — pakai derived jika ada, fallback ke static
export const mockAdminMetrics: MockAdminReportMetric[] = derivedAdminMetrics;

export const mockAdminSalesReports: MockAdminSalesReport[] =
  derivedAdminSalesReports.length > 0 ? derivedAdminSalesReports : staticSalesReports;
