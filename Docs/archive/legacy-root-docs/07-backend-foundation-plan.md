# 07 - Backend Foundation Plan

## Status Terkini

Backend foundation lokal sudah berjalan dan sekarang dipakai oleh:

- flow order harian,
- flow admin order minimal,
- flow package catalog,
- flow package request + review minimal,
- flow admin package CRUD minimal.

## Status Package Batch 5-7 (Accepted)

- Batch 5: admin package CRUD minimal aktif + package tetap by request.
- Batch 6: feedback edit package benar + search/filter admin package aktif.
- Batch 7: search/filter/status summary admin package request aktif, convert ke order diimplementasikan pada Batch 32.

## Endpoint Aktif

- `GET /api/health`
- `GET /api/menus`
- `POST /api/orders`
- `GET /api/orders`
- `PATCH /api/orders/[id]/status`
- `PATCH /api/orders/[id]/payment-status`
- `GET /api/packages`
- `POST /api/packages`
- `PATCH /api/packages/[id]`
- `PATCH /api/packages/[id]/status`
- `POST /api/package-requests`
- `GET /api/package-requests`
- `PATCH /api/package-requests/[id]/status`

## Struktur Data Lokal (SQLite)

Database lokal saat ini menyimpan:

- `dev_personas`
- `menus`
- `menu_daily_stock`
- `orders`
- `order_items`
- `delivery_info`
- `payment_info`
- `packages`
- `package_requests`

Kolom penting tambahan pada `orders`:

- `stock_status`
- `stock_deducted_at`
- `stock_released_at`

Kolom penting tambahan pada `package_requests`:

- `admin_note`
- `estimated_price`
- `reviewed_at`

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
- Public package catalog membaca data dari API package.
- Public `/paket-catering` hanya menampilkan package `active/available`.
- Public package request submit ke database lokal (`POST /api/package-requests`).
- Admin package request membaca list request dari database (read model).
- Admin package request review minimal (status + estimasi + catatan).
- Admin package create/update/toggle status aktif (tanpa hard delete).
- Admin package page punya search/filter sederhana.
- Admin package request page punya search/filter client-side + summary count + no-result state setelah filter.
- Batasan alur package tetap by request:
  - package tidak masuk cart,
  - package tidak masuk checkout,
  - package tidak langsung menjadi order,
  - **Active**: Convert package request ke order (Admin-driven).

## Batasan Penting (Hold Production)

Backend ini berfokus pada alur bisnis (Production Readiness Foundation):

- **Hold Production**:
  - Auth production (login/JWT/session/password/RBAC final).
  - Payment gateway/QRIS production (Real API).
  - Deployment production.
  - Official e-Faktur / Pajak resmi.
  - Hard delete package/request.
- **Local-Compatible (Active)**:
  - Payment verification manual (Fase B).
  - Commercial Invoice basic (Fase B).
  - Convert package request to order (Fase A).

## Known Issue (Project-wide)

- `npm run check` sudah mencapai `0 errors` (Mei 2026).
- Area yang masih dilaporkan:
  - `dashboard/admin/reports`
  - `dashboard/cs/menu`
  - `dashboard/cs/orders`
  - `dashboard/orders`
