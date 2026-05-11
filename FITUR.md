# FITUR Tien's Catering

Dokumen ini merangkum progres fitur project pada fase local development.

## Selesai

- Public katalog membaca menu dari API (`GET /api/menus`).
- Cart sudah stock-aware (batas qty mengikuti stok).
- Checkout submit order ke API (`POST /api/orders`).
- Order tersimpan ke database SQLite lokal.
- Order-success menampilkan response order API.
- Admin order list dan order detail membaca database (`GET /api/orders`).
- Admin update status order minimal aktif (`PATCH /api/orders/[id]/status`).
- Admin update payment status manual aktif (`PATCH /api/orders/[id]/payment-status`).
- Transaksi stok aktif:
  - stok tidak berkurang saat checkout submit,
  - stok berkurang saat order dikonfirmasi,
  - stok dikembalikan saat order dibatalkan jika sebelumnya sudah dipotong.
- Guard transaksi stok memakai `orders.stock_status` (`not_deducted`, `deducted`, `released`).
- Admin order flow polish aktif (label status order/payment/stock lebih jelas).
- Local backend foundation aktif (`/api/health`, `/api/menus`, `/api/orders`, patch admin minimal).
- Package catalog membaca API (`GET /api/packages`) dengan fallback mock.
- Admin package CRUD minimal aktif:
  - `POST /api/packages`,
  - `PATCH /api/packages/[id]`,
  - `PATCH /api/packages/[id]/status`,
  - create package default `inactive`,
  - update package dan toggle active/nonaktif tanpa hard delete.
- Package request tersimpan ke database (`POST /api/package-requests`).
- Admin package request list read-only aktif (`GET /api/package-requests`).
- Admin package request review minimal aktif (`PATCH /api/package-requests/[id]/status`):
  - update status request,
  - update estimasi harga manual,
  - update catatan admin.
- Batas flow package tetap by request:
  - package tidak masuk cart,
  - package tidak masuk checkout,
  - package tidak langsung menjadi order.

## Berjalan / Stabilizing

- Admin operational flow order lokal (status + payment manual + stock feedback).
- Admin operational flow package request lokal (review status + estimasi + catatan).
- Konsistensi read model untuk halaman admin list/detail.

## Hold

- Convert package request ke order.
- Hard delete package.
- Super Admin flow final.
- Role management.
- Payment verification.
- Payment gateway / QRIS production.
- Upload bukti pembayaran production.
- Rekening/payment account integration production.
- Package payment/invoice production.
- CS dashboard berbasis database.
- User dashboard berbasis database.
- Auth production.
- Invoice/pajak production.

## Roadmap Berikutnya

- User Dashboard database-backed untuk history order/request.
- Super Admin local role management (tahap berikutnya).
- Payment verification minimal (setelah disetujui scope berikutnya).
