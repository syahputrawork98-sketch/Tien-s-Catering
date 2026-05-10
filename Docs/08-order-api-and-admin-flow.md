# 08 - Order API and Admin Flow

## Ringkasan

Dokumen ini merangkum alur order lokal setelah backend order API dan admin read-only berjalan.

## Alur Order Lokal Saat Ini

1. Public katalog membaca menu dari `GET /api/menus`.
2. User menambahkan item ke cart dengan validasi stock-aware di frontend.
3. Checkout mengirim order ke `POST /api/orders`.
4. Backend menyimpan order ke SQLite lokal (`orders`, `order_items`, `delivery_info`, `payment_info`).
5. Order-success menampilkan ringkasan response order API.
6. Admin membuka `/dashboard/admin/orders` dan membaca data order via `GET /api/orders`.
7. Admin detail modal menampilkan data order DB-safe dalam mode read-only.

## Endpoint yang Tersedia

- `GET /api/health`
- `GET /api/menus`
- `POST /api/orders`
- `GET /api/orders`

## Data yang Sudah Database-Backed

- Menu harian + stok harian.
- Order header.
- Item order.
- Informasi pengantaran order.
- Informasi pembayaran sederhana order.
- Admin order list/detail (read-only).

## Data/Flow yang Masih Mock atau Hold

- Admin mutation order (update status/cancel/complete).
- Payment verification workflow.
- CS dashboard berbasis database.
- User dashboard berbasis database.
- Super Admin flow final.

## Batasan Saat Ini

- Tidak ada stock decrement transaction saat order dibuat.
- Tidak ada stock restore transaction saat pembatalan.
- Tidak ada payment gateway/QRIS production/upload bukti.
- Tidak ada auth production (login/JWT/session/password/RBAC).
- Tidak ada deployment production.

## Arah Setelah Batch 6

- Batch 7: Admin Update Status Order Minimal.
- Setelah itu: payment status manual minimal.
- Desain stock transaction menyusul setelah flow status/payment lebih stabil.
