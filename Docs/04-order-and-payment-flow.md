# 04 - Order and Payment Flow

## Alur Order Lokal Saat Ini

1. Public katalog membaca menu dari `GET /api/menus`.
2. Cart berjalan stock-aware di frontend (batas qty mengikuti stok yang tersedia di cart item).
3. Checkout submit payload ke `POST /api/orders`.
4. Order disimpan ke SQLite lokal (`orders`, `order_items`, `delivery_info`, `payment_info`).
5. Order-success menampilkan ringkasan response order.
6. Admin order list membaca data order dari `GET /api/orders` (read-only).
7. Admin detail order membaca data DB-safe (read-only).

## Lokasi Pengantaran (Fase Sekarang)

- Bidang/dinas/bagian (`departmentOrUnit`)
- Lantai (`floor`)
- Catatan lokasi (`locationNote`)
- Ringkasan lokasi (`addressSummary`)

## Metode Pembayaran Awal

- `cash`
- `transfer`
- `qris`
- `cod`

## Status Pembayaran Awal

- `unpaid`
- `cod`

## Status Order Saat Ini

- Status order berasal dari backend order foundation dan masih sederhana untuk kebutuhan read-only admin.
- Mutation status admin masih Hold (belum ada update status via API).

## Item Hold (Belum Aktif)

- Payment verification.
- Admin update status/cancel/complete mutation.
- Stock decrement transaction saat order dibuat.
- Stock restore transaction saat order dibatalkan.
