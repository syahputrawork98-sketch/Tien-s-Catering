# 07 - Backend Foundation Plan

## Status Terkini

Backend foundation lokal sudah berjalan dan dipakai oleh flow order + admin read-only.

## Endpoint Aktif

- `GET /api/health`
- `GET /api/menus`
- `POST /api/orders`
- `GET /api/orders`

## Struktur Data Lokal (SQLite)

Database lokal saat ini menyimpan:

- `dev_personas`
- `menus`
- `menu_daily_stock`
- `orders`
- `order_items`
- `delivery_info`
- `payment_info`

## Persona Development

Dev persona switcher tetap dipakai pada local development:

- Konsumen
- Admin
- Super Admin

## Integrasi yang Sudah Aktif

- Public katalog membaca menu API.
- Checkout menulis order ke DB lewat API.
- Admin order list/detail membaca DB secara read-only.

## Batasan Penting (Masih Berlaku)

Backend ini belum production-ready:

- Belum ada auth production (login/JWT/session/password/RBAC).
- Belum ada payment gateway/QRIS production/upload bukti.
- Belum ada deployment production.
- Belum ada stock decrement/restore transaction.
- Mutation admin order (update status/payment/cancel/complete) masih Hold.
