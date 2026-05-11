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

## Status Stabilisasi Batch 11-14 (Accepted)

- Batch 11: Customer order dashboard (`/dashboard/orders`) sudah database-backed via `GET /api/orders`.
- Batch 12: CS orders dashboard (`/dashboard/cs/orders`) sudah database-backed via `GET /api/orders`.
- Batch 13: Payment status clarity diselaraskan lintas role (Customer, CS, Admin) dengan wording "Simulasi" untuk local-development.
- Batch 14: Customer package request visibility aktif via `/dashboard/package-requests` dan `GET /api/package-requests`.

## Data yang Sudah Database-Backed

- Menu harian + stok harian.
- Order header.
- Item order.
- Informasi pengantaran order.
- Informasi pembayaran sederhana order.
- Status stok order (`stock_status`, `stock_deducted_at`, `stock_released_at`).
- Admin order list/detail + aksi minimal status/payment.
- Customer dashboard order history.
- CS dashboard order list + aksi minimal status/payment.
- Customer package request history (visibility).

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

- Admin reports masih simulasi lokal/mock (bukan reporting engine production).
- Payment verification otomatis.
- Payment gateway/QRIS production.
- Upload bukti pembayaran production.
- Super Admin flow final.
- Auth production (login/JWT/session/password/RBAC).
- Profile & Address management customer (masih mock/local-only).
- Convert package request ke order (Hold).

## Known Issue (Project-wide)

- `npm run check` sudah `0 errors` dengan sisa baseline warnings (a11y/css).
- Area warning utama:
  - `src/lib/components/ModalMenuDetail.svelte`
  - `src/routes/dashboard/admin/settings/+page.svelte`
  - `src/routes/dashboard/admin/tax/+page.svelte`
  - `src/routes/dashboard/admin/users/+page.svelte`
  - `src/routes/dashboard/cs/customers/+page.svelte`

## Arah Strategis (Roadmap)

- Batch 16+: Super Admin local role management.
- Batch 17+: Profile & Address management database-backed.
- Batch 18+: Penguatan alur manual review payment.
