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

## Berjalan / Stabilizing

- Admin operational flow lokal (status + payment manual + stock feedback).
- Konsistensi read model order untuk kebutuhan admin list/detail.
- Hardening validasi edge case local workflow.

## Hold

- Payment verification.
- Payment gateway / QRIS production.
- Upload bukti pembayaran production.
- Rekening/payment account integration production.
- CS dashboard berbasis database.
- User dashboard berbasis database.
- Super Admin flow final.
- Auth production.
- Invoice/pajak production.

## Roadmap Berikutnya

- Stabilizing lanjutan admin workflow (status + payment + stock) di local development.
- Payment verification minimal (setelah disetujui scope berikutnya).
- Migrasi CS/User dashboard ke database secara bertahap.
- Docs sync berikutnya setelah beberapa batch tambahan.
