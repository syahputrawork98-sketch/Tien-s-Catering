# 08 - Order API and Admin Flow

## Ringkasan

Dokumen ini merangkum alur order lokal setelah payment manual, transaksi stok, dan stabilisasi dashboard/admin pada Batch 8-10.

## Alur Order Lokal Saat Ini

1. Public katalog membaca menu dari `GET /api/menus`.
2. User menambahkan item ke cart dengan validasi stock-aware di frontend.
3. Checkout mengirim order ke `POST /api/orders`.
4. Backend menyimpan order ke SQLite lokal (`orders`, `order_items`, `delivery_info`, `payment_info`).
5. Order-success menampilkan ringkasan response order API.
6. Admin membuka `/dashboard/admin/orders` dan membaca data order via `GET /api/orders`.
7. Admin update status order via `PATCH /api/orders/[id]/status`.
8. Admin update payment status manual via `PATCH /api/orders/[id]/payment-status`.
9. Admin UI menampilkan label status order/payment/stock untuk memperjelas flow operasional.

## Endpoint yang Tersedia

- `GET /api/health`
- `GET /api/menus`
- `POST /api/orders`
- `GET /api/orders`
- `PATCH /api/orders/[id]/status`
- `PATCH /api/orders/[id]/payment-status`

## Status Stabilisasi Batch 21-29 (Accepted)

- Batch 21: Admin package request review aktif (status, estimasi harga, catatan admin) via `PATCH /api/package-requests`.
- Batch 22: Customer dashboard home summary (`/dashboard`) aktif dengan data ringkasan database SQLite.
- Batch 23: CS customers handling clarity (simulasi lokal).
- Batch 24: Admin settings clarity (Hold production governance).
- Batch 25: Public menu detail a11y & visual polish.
- Batch 26: Admin Reports Phase 2: Full local summary terintegrasi `GET /api/orders` (Revenue, Sales, Orders, Finance).
- Batch 27: Customer Profile & Address local CRUD simulation polish.
- Batch 28: Admin Users management local simulation Phase 2.
- Batch 29: End-to-End Demo Flow Polish & Unified Local Simulation Labeling.

## Data yang Sudah Database-Backed

- Menu harian + stok harian.
- Order header & items.
- Informasi pengantaran & pembayaran dasar.
- Status stok order (`stock_status`).
- Admin order list/detail + aksi status/payment.
- Customer dashboard summary & order history.
- CS dashboard order & customer list.
- Admin Reports summary & detail (Revenue, Sales, Orders, Finance tabs).
- Package request list & review (Admin/Customer).

## Aturan Transaksi Stok

- Stok tidak berkurang saat checkout submit.
- Stok berkurang saat status order menjadi `confirmed`.
- Stok dikembalikan saat status order menjadi `cancelled`, hanya jika status stok sebelumnya `deducted`.
- Guard transaksi stok memakai `orders.stock_status`: `not_deducted`, `deducted`, `released`.

## Data/Flow yang Masih Mock atau Hold

- **Hold Production / Final**:
  - Payment gateway production (QRIS Real/API).
  - Auth production (Login/JWT/Session/RBAC Final).
  - Invoice & Pajak riil (e-Faktur).
  - Deployment hardening final.
- **Local-Compatible (Active/Planned)**:
  - Convert package request ke order (**Active**).
  - Payment verification manual (**Active**).
  - Export CSV/PDF basic (**Planned/Ready**).

## Known Issue (Project-wide)

- `npm run check` sudah `0 errors` dengan sisa baseline warnings minor.
- Area warning utama: `src/lib/components/ModalMenuDetail.svelte` (A11y).

## Arah Strategis (Roadmap)

- Batch 31-35: Tahap Evaluasi Final & Persiapan Serah Terima (Handover).
- Batch 36+: Final Simulation of Advanced Admin Features (Inventory/Suppliers).
