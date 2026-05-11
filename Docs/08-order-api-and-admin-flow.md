# 08 - Order API and Admin Flow

## Ringkasan

Dokumen ini merangkum alur order lokal setelah status admin, payment manual, dan transaksi stok aktif.

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

## Data yang Sudah Database-Backed

- Menu harian + stok harian.
- Order header.
- Item order.
- Informasi pengantaran order.
- Informasi pembayaran sederhana order.
- Status stok order (`stock_status`, `stock_deducted_at`, `stock_released_at`).
- Admin order list/detail + aksi minimal status/payment.

## Aturan Transaksi Stok

- Stok tidak berkurang saat checkout submit.
- Stok berkurang saat status order menjadi `confirmed`.
- Stok dikembalikan saat status order menjadi `cancelled`, hanya jika status stok sebelumnya `deducted`.
- Jika stok kurang saat confirm, request status gagal (`400`) dan status order tetap.
- Item tanpa `menuId` diabaikan untuk backward compatibility.
- Status stok order:
  - `not_deducted`
  - `deducted`
  - `released`

## Data/Flow yang Masih Mock atau Hold

- Payment verification workflow.
- Payment gateway/QRIS production.
- Upload bukti pembayaran production.
- CS dashboard berbasis database.
- User dashboard berbasis database.
- Super Admin flow final.

## Batasan Saat Ini

- Tidak ada stock reservation.
- Tidak ada stock timeout reservation.
- Tidak ada auth production (login/JWT/session/password/RBAC).
- Tidak ada deployment production.

## Batas Alur dengan Package Request

- Flow order admin di dokumen ini fokus pada `orders`.
- Flow package request memakai endpoint dan halaman admin terpisah.
- Package request belum otomatis dikonversi ke order.

## Sinkronisasi Package Flow (Batch 5-7)

- Public package catalog:
  - `/paket-catering` membaca `GET /api/packages`,
  - hanya menampilkan package `active/available`,
  - package tetap by request (bukan cart/checkout/order instan).
- Admin package management:
  - `/dashboard/admin/packages` aktif untuk create/update/toggle active-inactive,
  - package baru default `inactive`,
  - slug auto-generate dari name,
  - multiple images via textarea URL per baris,
  - search/filter sederhana di admin page.
- Package request flow:
  - public submit request via `POST /api/package-requests`,
  - admin membaca list via `GET /api/package-requests`,
  - admin review minimal via `PATCH /api/package-requests/[id]/status` (status + estimasi + catatan),
  - admin page request punya search/filter/status summary/no-result state.
- Hold tetap berlaku:
  - convert package request ke order masih disabled/Hold,
  - package tidak masuk cart/checkout dan tidak langsung menjadi order,
  - package payment/invoice masih Hold,
  - hard delete package/request tidak ada,
  - Super Admin dan role management tidak ada,
  - auth production (login/JWT/session/password/RBAC) belum ada.

## Known Issue (Project-wide)

- `npm run check` masih gagal karena technical debt lama di luar package batch.
- Area yang masih dilaporkan:
  - `dashboard/admin/reports`
  - `dashboard/cs/menu`
  - `dashboard/cs/orders`
  - `dashboard/orders`

## Arah Setelah Batch 10

- Payment verification minimal (setelah ada keputusan scope berikutnya).
- Penguatan flow operasional admin (status + payment) di local development.
- Migrasi bertahap CS/User dashboard ke data database.
