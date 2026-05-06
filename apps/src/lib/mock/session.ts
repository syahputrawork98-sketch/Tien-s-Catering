// ============================================================
// session.ts — Adapter compatibility untuk mock login/session
// Data user demo berasal dari accounts.ts
// ============================================================

import { mockAccounts } from './accounts';

export type MockRole = 'USER' | 'CUSTOMER_SERVICE' | 'ADMIN';

export type MockUser = {
  id: string;
  name: string;
  email: string;
  role: MockRole;
};

// ─── Derive demo users dari accounts.ts ──────────────────
const adminAccount = mockAccounts.find(a => a.role === 'ADMIN');
const csAccount = mockAccounts.find(a => a.role === 'CUSTOMER_SERVICE');
const userAccount = mockAccounts.find(a => a.role === 'USER' && a.id === 'user-001');

export const mockUsers: Record<MockRole, MockUser> = {
  USER: {
    id: userAccount?.id ?? 'user-001',
    name: userAccount?.name ?? 'Customer Demo',
    email: userAccount?.email ?? 'customer@tienscatering.test',
    role: 'USER'
  },
  CUSTOMER_SERVICE: {
    id: csAccount?.id ?? 'cs-001',
    name: csAccount?.name ?? 'CS Demo',
    email: csAccount?.email ?? 'cs@tienscatering.test',
    role: 'CUSTOMER_SERVICE'
  },
  ADMIN: {
    id: adminAccount?.id ?? 'admin-001',
    name: adminAccount?.name ?? 'Admin Demo',
    email: adminAccount?.email ?? 'admin@tienscatering.test',
    role: 'ADMIN'
  }
};

export const roleLabels: Record<MockRole, string> = {
  USER: 'Customer',
  CUSTOMER_SERVICE: 'Customer Service',
  ADMIN: 'Admin'
};
