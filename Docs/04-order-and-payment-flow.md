# 04 - Order and Payment Flow

## Alur Order Lokal Saat Ini

1. Public katalog membaca menu dari `GET /api/menus`.
2. Cart berjalan stock-aware di frontend (batas qty mengikuti stok yang tersedia di cart item).
3. Checkout submit payload ke `POST /api/orders`.
4. Order disimpan ke SQLite lokal (`orders`, `order_items`, `delivery_info`, `payment_info`).
5. Order-success menampilkan ringkasan response order.
6. Admin order list/detail membaca data order dari `GET /api/orders`.
7. Admin update status order via `PATCH /api/orders/[id]/status`.
8. Admin update payment status manual via `PATCH /api/orders/[id]/payment-status`.

## Lokasi Pengantaran (Fase Sekarang)

- Bidang/dinas/bagian (`departmentOrUnit`)
- Lantai (`floor`)
- Catatan lokasi (`locationNote`)
- Ringkasan lokasi (`addressSummary`)

## Metode Pembayaran (Manual Lokal)

- `cash`
- `transfer`
- `qris`
- `cod`

## Status Pembayaran (Manual Lokal)

- `unpaid`
- `waiting_verification`
- `paid`
- `cod`

## Alur Transaksi Stok

- Stok **tidak** berkurang saat checkout submit (`POST /api/orders`).
- Stok berkurang saat admin mengubah status order ke `confirmed`.
- Jika stok kurang saat confirm, request status gagal (`400`) dan status order tetap.
- Stok dikembalikan saat admin mengubah status ke `cancelled`, hanya jika sebelumnya sudah dipotong.
- Retry `cancelled` tidak menambah stok lagi (anti double restore).
- Item order tanpa `menuId` diabaikan untuk backward compatibility.
- Guard utama memakai `orders.stock_status`:
  - `not_deducted`
  - `deducted`
  - `released`
- Status lain (`processing`, `ready`, `delivered`, `completed`) tidak mengubah stok.

## Item Hold (Belum Aktif)

- Payment verification.
- Payment gateway/QRIS production.
- Upload bukti pembayaran production.
- Auth production (login/JWT/session/password/RBAC).
