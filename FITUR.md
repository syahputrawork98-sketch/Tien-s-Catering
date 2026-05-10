# FITUR Tien's Catering

Dokumen ini merangkum progres fitur project pada fase local development.

## Selesai

- Public katalog membaca menu dari API (`GET /api/menus`).
- Cart sudah stock-aware (batas qty mengikuti stok).
- Checkout submit order ke API (`POST /api/orders`).
- Order tersimpan ke database SQLite lokal.
- Order-success menampilkan response order API.
- Admin order list membaca database secara read-only (`GET /api/orders`).
- Admin order detail sudah DB-safe/read-only.
- Local backend foundation aktif (`/api/health`, `/api/menus`, `/api/orders`).

## Berjalan / Stabilizing

- Admin operational flow read-only.
- Order API pada local development.
- Read model order untuk kebutuhan admin list/detail.

## Hold

- Admin update status order.
- Payment verification.
- CS dashboard berbasis database.
- User dashboard berbasis database.
- Super Admin flow final.
- Stock decrement/restore transaction.
- Payment gateway.
- Auth production.
- Invoice/pajak production.

## Roadmap Berikutnya

- Batch 7: Admin Update Status Order Minimal.
- Payment status manual minimal (setelah flow status lebih stabil).
- Desain stock transaction (decrement/restore) setelah status/payment flow stabil.
- Docs sync berikutnya setelah beberapa batch tambahan.
