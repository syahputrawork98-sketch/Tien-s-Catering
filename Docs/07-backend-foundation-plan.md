# 07 - Backend Foundation Plan

## Tujuan Batch

Batch ini membuka fondasi backend lokal untuk Tien's Catering dengan pendekatan bertahap:

- SvelteKit API routes (tanpa server terpisah).
- SQLite lokal sebagai database awal development.
- API read-only untuk health check dan menu harian + stok.

## Status Scope Saat Ini

Batch Backend 1 mencakup:

- `GET /api/health`
- Foundation database lokal (inisialisasi tabel + seed data dev)
- `GET /api/menus` (read-only menu dan stok)

## Batasan Penting

Batch ini **bukan production backend**.  
Yang belum masuk scope:

- Login production
- JWT/session/password production
- RBAC production
- Payment gateway / QRIS production
- Checkout menulis order ke database
- Admin membaca order dari database
- Stock decrement transaction

## Persona Development

Dev persona switcher frontend tetap dipakai seperti sebelumnya.  
Database lokal hanya menyediakan seed persona awal untuk fondasi data:

- Konsumen
- Admin
- Super Admin

## Catatan Implementasi

- Backend tetap berjalan dalam aplikasi `apps/` (SvelteKit).
- Database disiapkan untuk local development, bukan deployment production.
- Seed awal fokus pada menu harian dan stok untuk mendukung API read-only.
- Mock data frontend belum dihapus dan belum dimigrasi penuh pada batch ini.

## Item Hold (Lanjutan Batch Berikutnya)

- Integrasi frontend katalog ke API backend
- Persist order dari checkout ke database
- Pembacaan order database di dashboard admin/CS
- Mekanisme transaksi pengurangan/pengembalian stok
