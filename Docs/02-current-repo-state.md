# 02 - Current Repo State

## Ringkasan Kondisi Repo Saat Ini

- Repo fokus pada fungsionalitas bisnis (Pre-Auth mode).
- `apps/` adalah aplikasi utama (SvelteKit + local API routes).
- Project menggunakan **Developer Persona Switcher** (Role + Account Selector) untuk simulasi multi-role.
- Pilihan Role dan Akun Aktif disimpan di **localStorage** untuk persistensi simulasi.
- Penyimpanan data menggunakan **SQLite Lokal**.

## Status Teknis Saat Ini

- Local backend foundation sudah aktif.
- SQLite lokal dipakai untuk data operasional:
  - persona dev,
  - menu + daily stock,
  - orders + order_items + delivery_info + payment_info,
  - customer registration status.
- Public katalog membaca data menu dari API (`GET /api/menus`).
- Checkout menulis order ke API (`POST /api/orders`).
- Admin area (Orders, Reports, Customers) membaca dan menulis ke database via API lokal.
- Auth masih simulasi/dev persona switcher (belum auth production).
- Payment gateway masih dalam mode simulasi bukti transfer (Hold Production).
- Stock management (decrement/restore) sudah aktif dalam alur konfirmasi/pembatalan order.

## Deployment Readiness & Phase E (Batch 48+)

- **Batch 47**: Business-Complete / Pre-Auth. Aplikasi siap untuk demo bisnis lokal secara penuh.
- **Batch 48**: Fase E (Production Readiness) resmi dibuka.
- **Build Hygiene**: `npm run check` 0 errors.
- **Status Production**: Belum ready untuk public release. Fokus saat ini adalah menutup gap antara simulasi lokal dan standar produksi (Auth, Security, Cloud Storage).
- **Hold for Production**: Beberapa fitur (Payment Gateway Real, Auth Production, Cloud Storage) masih ditahan hingga batch yang ditentukan di roadmap Fase E.

## Catatan Arah Dokumen

`Docs/`, `FITUR.md`, dan `README.md` aktif adalah source of truth arah produk dan status repo.
Keputusan terbaru Room Chat 00 menjadi acuan utama.
Setiap Batch di Fase E akan memperbarui `Docs/10-production-readiness-gap.md` jika ada gap yang tertutup.
