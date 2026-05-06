// ============================================================
// audit.ts — Mock Audit Log untuk Admin
// Riwayat perubahan penting di sistem (UI-only simulation)
// ============================================================

export type MockAuditActor = 'user' | 'cs' | 'admin';

export type MockAuditTargetType =
  | 'order'
  | 'menu'
  | 'package'
  | 'customer'
  | 'user'
  | 'settings';

export type MockAuditLog = {
  id: string;
  actor: MockAuditActor;
  actorName: string;
  action: string;
  targetType: MockAuditTargetType;
  targetId: string;
  note?: string;
  createdAt: string;
};

export const mockAuditLogs: MockAuditLog[] = [
  {
    id: 'AUD-001',
    actor: 'admin',
    actorName: 'Admin Demo',
    action: 'Mengubah status pesanan menjadi Selesai (Override)',
    targetType: 'order',
    targetId: 'ORD-2026-004',
    note: 'Pesanan telah selesai diantar. Override berdasarkan konfirmasi telepon customer.',
    createdAt: '2026-05-06 10:45'
  },
  {
    id: 'AUD-002',
    actor: 'cs',
    actorName: 'CS Demo',
    action: 'Mengkonfirmasi pesanan baru',
    targetType: 'order',
    targetId: 'ORD-2026-002',
    note: 'Pesanan dikonfirmasi dan masuk ke antrian produksi.',
    createdAt: '2026-05-06 09:30'
  },
  {
    id: 'AUD-003',
    actor: 'admin',
    actorName: 'Admin Demo',
    action: 'Mengubah harga paket',
    targetType: 'package',
    targetId: 'pkg-prasmanan',
    note: 'Harga disesuaikan dari Rp 60.000 menjadi Rp 65.000 per pax karena kenaikan bahan baku.',
    createdAt: '2026-05-05 16:20'
  },
  {
    id: 'AUD-004',
    actor: 'admin',
    actorName: 'Admin Demo',
    action: 'Menyetujui pendaftaran customer baru',
    targetType: 'customer',
    targetId: 'CUS-002',
    note: 'Customer sudah diverifikasi via WhatsApp. Tipe akun: Personal.',
    createdAt: '2026-05-05 14:10'
  },
  {
    id: 'AUD-005',
    actor: 'cs',
    actorName: 'CS Demo',
    action: 'Menolak pendaftaran customer',
    targetType: 'customer',
    targetId: 'CUS-NEW-003',
    note: 'Nomor WhatsApp tidak aktif saat diverifikasi.',
    createdAt: '2026-05-05 13:00'
  },
  {
    id: 'AUD-006',
    actor: 'admin',
    actorName: 'Admin Demo',
    action: 'Menonaktifkan menu publik',
    targetType: 'menu',
    targetId: 'MENU-003',
    note: 'Menu Prasmanan Premium dinonaktifkan sementara karena stok habis dan belum bisa dipasok.',
    createdAt: '2026-05-05 11:30'
  },
  {
    id: 'AUD-007',
    actor: 'admin',
    actorName: 'Admin Demo',
    action: 'Mengubah pengaturan sistem',
    targetType: 'settings',
    targetId: 'SET-002',
    note: 'Update nomor WhatsApp CS dari 081234567890 ke 081234567891.',
    createdAt: '2026-05-04 15:45'
  },
  {
    id: 'AUD-008',
    actor: 'user',
    actorName: 'PT Maju Bersama',
    action: 'Membatalkan pesanan',
    targetType: 'order',
    targetId: 'ORD-2026-005',
    note: 'Customer membatalkan pesanan secara mandiri melalui dashboard.',
    createdAt: '2026-05-04 12:00'
  },
  {
    id: 'AUD-009',
    actor: 'cs',
    actorName: 'CS Demo',
    action: 'Menambah menu baru',
    targetType: 'menu',
    targetId: 'MENU-005',
    note: 'Menu Es Teh Manis ditambahkan untuk periode Mei 2026.',
    createdAt: '2026-05-04 09:00'
  },
  {
    id: 'AUD-010',
    actor: 'admin',
    actorName: 'Admin Demo',
    action: 'Membatalkan pesanan (Admin Override)',
    targetType: 'order',
    targetId: 'ORD-2026-005',
    note: 'Pesanan dibatalkan oleh admin atas permintaan customer melalui telepon langsung.',
    createdAt: '2026-05-03 17:20'
  },
  {
    id: 'AUD-011',
    actor: 'admin',
    actorName: 'Admin Demo',
    action: 'Menambah paket baru ke katalog',
    targetType: 'package',
    targetId: 'pkg-custom',
    note: 'Custom Event Package ditambahkan untuk segmen VIP dan corporate besar.',
    createdAt: '2026-05-03 10:00'
  },
  {
    id: 'AUD-012',
    actor: 'cs',
    actorName: 'CS Demo',
    action: 'Mengkonfirmasi penyelesaian pesanan',
    targetType: 'order',
    targetId: 'ORD-2026-004',
    note: 'Pesanan sudah selesai diantar. Konfirmasi dari CS berdasarkan laporan driver.',
    createdAt: '2026-05-02 18:00'
  }
];

// ─── Helper functions ─────────────────────────────────────
export function getAuditByActor(actor: MockAuditActor): MockAuditLog[] {
  return mockAuditLogs.filter(a => a.actor === actor);
}

export function getRecentAudit(limit = 5): MockAuditLog[] {
  return mockAuditLogs.slice(0, limit);
}
