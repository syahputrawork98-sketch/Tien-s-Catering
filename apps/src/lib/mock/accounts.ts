// ============================================================
// accounts.ts — Single Source of Truth untuk semua akun
// Dipakai oleh: session/login, CS customers, Admin users, user profile
// ============================================================

export type MockAccountRole = 'USER' | 'CUSTOMER_SERVICE' | 'ADMIN';

export type MockAccountType = 'personal' | 'company' | 'institution';

export type MockAccountStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';

export type MockAccountCreatedBy = 'public' | 'cs' | 'admin';

export type MockAccountApprovedBy = 'cs' | 'admin';

export type MockAccount = {
  id: string;
  name: string;
  email?: string;
  whatsapp?: string;
  address?: string;

  role: MockAccountRole;

  // Khusus customer/user
  accountType?: MockAccountType;
  requestedType?: MockAccountType;

  status: MockAccountStatus;
  registrationStatus?: 'pending' | 'approved' | 'rejected';

  createdBy?: MockAccountCreatedBy;
  approvedBy?: MockAccountApprovedBy;
  registeredAt?: string;
  approvedAt?: string;
  rejectedReason?: string;
  internalNote?: string;

  totalOrders?: number;
  lastOrderDate?: string;
  lastLogin?: string;
};

export const mockAccounts: MockAccount[] = [
  // ─── ADMIN ───────────────────────────────────────────────
  {
    id: 'admin-001',
    name: 'Admin Demo',
    email: 'admin@tienscatering.test',
    role: 'ADMIN',
    status: 'active',
    registrationStatus: 'approved',
    lastLogin: '2026-05-05 09:30'
  },

  // ─── CUSTOMER SERVICE ─────────────────────────────────────
  {
    id: 'cs-001',
    name: 'CS Demo',
    email: 'cs@tienscatering.test',
    role: 'CUSTOMER_SERVICE',
    status: 'active',
    registrationStatus: 'approved',
    lastLogin: '2026-05-05 10:15'
  },

  // ─── CUSTOMER / USER — Approved ───────────────────────────
  {
    id: 'CUS-001',
    name: 'PT Maju Bersama',
    email: 'finance@majubersama.test',
    whatsapp: '081234567890',
    address: 'Jl. Merdeka No. 10, Jakarta',
    role: 'USER',
    accountType: 'company',
    requestedType: 'company',
    status: 'approved',
    registrationStatus: 'approved',
    createdBy: 'public',
    approvedBy: 'admin',
    registeredAt: '2025-10-12',
    approvedAt: '2025-10-13',
    totalOrders: 12,
    lastOrderDate: '2026-05-01',
    lastLogin: '2026-05-04 18:20'
  },
  {
    id: 'CUS-002',
    name: 'Ibu Rina',
    email: 'rina@gmail.test',
    whatsapp: '087700001111',
    address: 'Jl. Anggrek No. 5, Bekasi',
    role: 'USER',
    accountType: 'personal',
    requestedType: 'personal',
    status: 'approved',
    registrationStatus: 'approved',
    createdBy: 'public',
    approvedBy: 'cs',
    registeredAt: '2026-01-20',
    approvedAt: '2026-01-21',
    totalOrders: 4,
    lastOrderDate: '2026-04-28',
    lastLogin: '2026-04-28 20:00'
  },
  {
    id: 'CUS-003',
    name: 'SMA Harapan Bangsa',
    email: 'sekolah@harapanbangsa.test',
    whatsapp: '082211112222',
    address: 'Jl. Pendidikan No. 3, Depok',
    role: 'USER',
    accountType: 'institution',
    requestedType: 'institution',
    status: 'approved',
    registrationStatus: 'approved',
    createdBy: 'public',
    approvedBy: 'admin',
    registeredAt: '2025-12-05',
    approvedAt: '2025-12-06',
    totalOrders: 8,
    lastOrderDate: '2026-04-20',
    lastLogin: '2026-04-20 09:00'
  },

  // Demo customer (yang dipakai untuk session login)
  {
    id: 'user-001',
    name: 'Customer Demo',
    email: 'customer@tienscatering.test',
    whatsapp: '081234567890',
    address: 'Jl. Melati No. 12, Jakarta Selatan',
    role: 'USER',
    accountType: 'personal',
    requestedType: 'personal',
    status: 'approved',
    registrationStatus: 'approved',
    createdBy: 'public',
    approvedBy: 'cs',
    registeredAt: '2026-01-10',
    approvedAt: '2026-01-11',
    totalOrders: 3,
    lastOrderDate: '2026-05-05',
    lastLogin: '2026-05-05 14:00'
  },

  // ─── CUSTOMER — Pending ───────────────────────────────────
  {
    id: 'CUS-NEW-001',
    name: 'Bapak Budi',
    whatsapp: '081211112222',
    address: 'Jl. Melati No. 45, Tangerang',
    role: 'USER',
    requestedType: 'personal',
    status: 'pending',
    registrationStatus: 'pending',
    createdBy: 'public',
    registeredAt: '2026-05-06',
    totalOrders: 0,
    lastOrderDate: '-'
  },
  {
    id: 'CUS-NEW-002',
    name: 'Startup XYZ',
    whatsapp: '085566667777',
    address: 'Co-working Space, Kuningan, Jakarta',
    role: 'USER',
    requestedType: 'company',
    status: 'pending',
    registrationStatus: 'pending',
    createdBy: 'public',
    registeredAt: '2026-05-06',
    totalOrders: 0,
    lastOrderDate: '-'
  },

  // ─── CUSTOMER — Rejected ──────────────────────────────────
  {
    id: 'CUS-NEW-003',
    name: 'Yayasan Amal',
    whatsapp: '081122223333',
    address: 'Jl. Kebahagiaan No. 1, Bogor',
    role: 'USER',
    requestedType: 'institution',
    status: 'rejected',
    registrationStatus: 'rejected',
    createdBy: 'public',
    registeredAt: '2026-05-05',
    rejectedReason: 'Nomor WhatsApp tidak aktif saat diverifikasi.',
    totalOrders: 0,
    lastOrderDate: '-'
  }
];
