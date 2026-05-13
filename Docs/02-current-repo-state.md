# 02 - Current Repo State

## Ringkasan Kondisi Repo Saat Ini

- `apps/` tetap menjadi aplikasi utama (SvelteKit frontend + local API routes).
- Project berjalan pada mode local development.

## Status Teknis Saat Ini

- Local backend foundation sudah aktif.
- SQLite lokal dipakai untuk data awal:
  - persona dev,
  - menu + daily stock,
  - orders + order_items + delivery_info + payment_info.
- Public katalog membaca data menu dari API (`GET /api/menus`).
- Checkout menulis order ke API (`POST /api/orders`).
- Admin order list dan order detail membaca database secara read-only (`GET /api/orders`).
- Auth masih simulasi/dev persona switcher (belum auth production).
- Payment gateway belum ada (termasuk QRIS production/upload bukti).
- Stock decrement/restore transaction belum aktif.

## Technical Debt Baseline

- `npm run check` baseline masih memiliki issue lama project-wide di area di luar batch backend order admin.
- Issue tersebut perlu ditangani bertahap terpisah dari scope feature batch.

## Catatan Arah Dokumen

`Docs/`, `FITUR.md`, dan `README.md` aktif adalah source of truth arah produk dan status repo.
Keputusan terbaru Room Chat 00 menjadi acuan utama.
