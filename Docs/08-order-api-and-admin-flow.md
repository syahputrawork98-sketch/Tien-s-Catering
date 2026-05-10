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

## Arah Setelah Batch 10

- Payment verification minimal (setelah ada keputusan scope berikutnya).
- Penguatan flow operasional admin (status + payment) di local development.
- Migrasi bertahap CS/User dashboard ke data database.
