# 07 - Backend Foundation Plan

## Status Terkini

Backend foundation lokal sudah berjalan dan dipakai oleh flow order + admin operational minimal.

## Endpoint Aktif

- `GET /api/health`
- `GET /api/menus`
- `POST /api/orders`
- `GET /api/orders`
- `PATCH /api/orders/[id]/status`
- `PATCH /api/orders/[id]/payment-status`

## Struktur Data Lokal (SQLite)

Database lokal saat ini menyimpan:

- `dev_personas`
- `menus`
- `menu_daily_stock`
- `orders`
- `order_items`
- `delivery_info`
- `payment_info`

Kolom penting tambahan pada `orders`:

- `stock_status`
- `stock_deducted_at`
- `stock_released_at`

## Persona Development

Dev persona switcher tetap dipakai pada local development:

- Konsumen
- Admin
- Super Admin

## Integrasi yang Sudah Aktif

- Public katalog membaca menu API.
- Checkout menulis order ke DB lewat API.
- Admin order list/detail membaca DB.
- Admin update status order minimal.
- Admin update payment status manual.
- Transaksi stok lokal:
  - potong stok saat `confirmed`,
  - restore stok saat `cancelled` (jika sebelumnya deducted),
  - guard via `orders.stock_status`.

## Batasan Penting (Masih Berlaku)

Backend ini belum production-ready:

- Belum ada auth production (login/JWT/session/password/RBAC).
- Belum ada payment gateway/QRIS production/upload bukti.
- Belum ada deployment production.
- Belum ada payment verification final workflow.
- Belum ada stock reservation/timeout.
- Belum ada admin stock adjustment UI.
