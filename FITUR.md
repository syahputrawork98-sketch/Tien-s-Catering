# FITUR Tien's Catering

Dokumen ini merangkum progres fitur project pada fase local development.

## Status Package Batch (Accepted)

- Package Batch 5:
  - Admin Package CRUD minimal aktif (`POST /api/packages`, `PATCH /api/packages/[id]`, `PATCH /api/packages/[id]/status`).
  - `/dashboard/admin/packages` aktif untuk create/update/aktif-nonaktif package.
  - Package baru default `inactive`.
  - Slug auto-generate dari name.
  - Multiple images via textarea URL per baris.
  - Tidak ada hard delete, Super Admin, role management, convert request to order, atau package payment/invoice.
- Package Batch 6:
  - Feedback edit package sudah benar (`Paket berhasil diperbarui` untuk mode edit).
  - Search/filter sederhana admin package sudah aktif.
- Package Batch 7:
  - Admin package request sudah punya search client-side, status filter, summary count, dan no-result state setelah filter.
  - Convert ke order tetap Hold/disabled.

## Status Order Batch (Accepted)

- Batch 8:
  - Customer order dashboard (`/dashboard/orders`) sudah distabilkan.
  - CS orders handling (`/dashboard/cs/orders`) sudah distabilkan.
  - Konsistensi mock/type ringan antar customer dan CS orders sudah dirapikan.
- Batch 9:
  - Admin order management (`/dashboard/admin/orders`) sudah distabilkan.
  - Konsistensi list/detail/action status+payment mengikuti endpoint existing.
- Batch 10:
  - Admin reports clarity (`/dashboard/admin/reports`) sudah dirapikan.
  - Reports ditegaskan sebagai simulasi/lokal (mock), bukan reporting engine production.
  - Export laporan production tetap Hold/disabled.

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
- Public `/paket-catering` membaca package API (`GET /api/packages`) dan hanya menampilkan package `active/available`.
- Package tetap by request.
- Admin package management `/dashboard/admin/packages` aktif:
  - `POST /api/packages`,
  - `PATCH /api/packages/[id]`,
  - `PATCH /api/packages/[id]/status`,
  - create package default `inactive`,
  - update package dan toggle active/nonaktif tanpa hard delete,
  - slug auto-generate dari name,
  - multiple images via textarea URL per baris,
  - search/filter sederhana di admin package page.
- Public package detail submit request ke database (`POST /api/package-requests`).
- Admin package request list aktif (`GET /api/package-requests`).
- Admin package request review minimal aktif (`PATCH /api/package-requests/[id]/status`):
  - update status request,
  - update estimasi harga manual,
  - update catatan admin.
- Admin package request page punya polish UI:
  - search client-side,
  - status filter client-side,
  - summary count,
  - no-result state setelah filter.
- Customer order dashboard stabil:
  - active/history/empty state lebih jelas,
  - payment breakdown dan proof history aman untuk optional data.
- CS orders handling stabil:
  - tab/filter/status lebih konsisten,
  - proof verification dan COD collection display selaras shape mock.
- Admin order management stabil:
  - list/detail/action status pembayaran lebih konsisten,
  - hanya memakai endpoint order yang sudah ada.
- Admin reports clarity:
  - wording menegaskan mode simulasi/lokal,
  - no-result state dan status badge lebih jelas,
  - export production tetap Hold.
- Batas flow package:
  - package tidak masuk cart,
  - package tidak masuk checkout,
  - package tidak langsung menjadi order.

## Berjalan / Local-Compatible

- Customer dashboard order masih local/mock-compatible (belum DB-backed penuh).
- CS dashboard order masih local/mock-compatible (belum DB-backed penuh).
- Admin operational package request masih fokus review minimal (status + estimasi + catatan).

## Hold

- Convert package request ke order.
- Package payment/invoice production.
- Hard delete package/request.
- Super Admin flow final.
- Role management.
- Payment verification.
- Payment gateway / QRIS production.
- Upload bukti pembayaran production.
- Rekening/payment account integration production.
- CS dashboard berbasis database.
- User dashboard berbasis database.
- Auth production (login/JWT/session/password/RBAC).
- Invoice/pajak production.

## Known Issue (Project-wide)

- `npm run check` sudah `0 errors` dan masih `18 warnings` (technical debt a11y/css non-blocking).
- Area warning utama saat ini:
  - `src/lib/components/ModalMenuDetail.svelte`
  - `src/routes/+page.svelte`
  - `src/routes/dashboard/admin/settings/+page.svelte`
  - `src/routes/dashboard/admin/tax/+page.svelte`
  - `src/routes/dashboard/admin/users/+page.svelte`
  - `src/routes/dashboard/cs/customers/+page.svelte`

## Roadmap Berikutnya

- User Dashboard database-backed untuk history order/request.
- Super Admin local role management (tahap berikutnya).
- Payment verification minimal (setelah disetujui scope berikutnya).
