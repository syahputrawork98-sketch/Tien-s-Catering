# Frontend Kanban

## Active Task
- [IN PROGRESS] Kanban Master Sync: Menyelaraskan dokumentasi dengan kondisi aplikasi terbaru.

## Public
- [UI-DONE] Multi-page structure (Home, Katalog, Paket, Tentang Kami, Kontak).
- [UI-DONE] Navbar dinamis dengan kontras optimal.
* [UI-DONE] Cart & Checkout flow lengkap secara visual.
- [UI-DONE] Login & Register UI-only dengan simulasi role.
- [TODO] Public Paket Catering harus memakai `mockCatalogPackages` dari `catalog.ts`.
- [TODO] Public package cards harus menampilkan image dari `pkg.image`.
- [TODO] Halaman kontak public harus memakai lokasi Cimahi, Jawa Barat (Terapi Telapak Tangan).
- [TODO] WhatsApp link menggunakan format `wa.me/628...`.

## Customer/User
- [UI-DONE] Dashboard overview ringkas.
- [UI-DONE] Riwayat pesanan dengan badge status.
- [UI-DONE] Manajemen alamat (Tambah/Hapus/Default).
- [UI-DONE] Edit profile sederhana.
- [TODO] Avatar profile menggunakan initial nama (bukan hardcoded 'G').
- [TODO] Status akun jelas (e.g., Customer Aktif).
- [TODO] Modal Ubah Password UI-only.
- [TODO] Flow pembayaran: Bayar Penuh, DP, atau COD.
- [TODO] Upload bukti pembayaran (simulasi client-side resize).

## CS (Customer Service)
- [UI-DONE] Monitoring pesanan masuk.
- [UI-DONE] Toggle stok menu harian.
- [UI-DONE] Direktori data pelanggan.
- [UI-DONE] Kategori paket catering di dashboard CS.
- [TODO] Validasi/Tolak bukti pembayaran.
- [TODO] Konfirmasi penerimaan uang COD.
- [TODO] Audit log validasi pembayaran (Role CS).

## Admin
- [UI-DONE] Metrik utama di dashboard admin.
- [UI-DONE] Manajemen user & role (Revamp Tahap 1: Primary Tabs & Search).
- [UI-DONE] Laporan (Revamp Tahap 1: Multi-tab & Contextual Search).
- [UI-DONE] Pengaturan sistem dasar.
- [TODO] Admin Users secondary tabs (Personal, Company, Institution).
- [TODO] Admin Packages refinement (Search/Filter/Sort).
- [TODO] Admin Package Categories management.
- [TODO] Admin Tax/Invoice/Payment Accounts settings.
- [TODO] Audit log validasi pembayaran (Role Admin).

## Mock Data / Shared Config
- [UI-DONE] Single Source of Truth (catalog, accounts, orders, reports).
- [TODO] Business/Contact config (Lokasi Cimahi).
- [TODO] Payment model expansion (Method, Plan, Breakdown, Proofs).
- [TODO] Payment accounts mock (Bank info, QRIS).

## Backend Later (Planned Phase 4)
- [BLOCKED-BACKEND] Authentication & Role Guard asli.
- [BLOCKED-BACKEND] Database persistence (Postgres/Drizzle).
- [BLOCKED-BACKEND] API Endpoints.
- [BLOCKED-BACKEND] Real File Upload (S3/Cloudinary).
- [BLOCKED-BACKEND] Real Invoice PDF & Data Export.
