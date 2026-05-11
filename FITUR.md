## Status Order & Dashboard Batch (Accepted)

- Batch 11:
  - Customer Order Dashboard (`/dashboard/orders`) sudah DB-backed via `GET /api/orders`.
  - Data order menampilkan riwayat riil dari database SQLite lokal.
- Batch 12:
  - CS Orders Dashboard (`/dashboard/cs/orders`) sudah DB-backed via `GET /api/orders`.
  - Aksi CS (konfirmasi order/payment) selaras dengan endpoint API existing.
- Batch 13:
  - Payment status clarity diselaraskan lintas Customer, CS, dan Admin dashboard.
  - Label status pembayaran (Belum Bayar, Menunggu Verifikasi, Lunas, COD) dan warna badge konsisten.
  - Wording ditegaskan sebagai "Simulasi" / "Manual" untuk mode local-development.
- Batch 14:
  - Customer Package Request visibility ditambahkan via `/dashboard/package-requests`.
  - Customer dapat melihat riwayat request paket yang dibuat via `GET /api/package-requests`.

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
  - update package dan toggle active/nonaktif tanpa hard delete,
  - multiple images via textarea URL per baris,
  - search/filter sederhana di admin package page.
- Public package detail submit request ke database (`POST /api/package-requests`).
- Admin package request list aktif (`GET /api/package-requests`).
- Admin package request review minimal aktif (`PATCH /api/package-requests/[id]/status`).
- Customer dashboard orders DB-backed (`/dashboard/orders`).
- CS dashboard orders DB-backed (`/dashboard/cs/orders`).
- Customer package request visibility aktif (`/dashboard/package-requests`).
- Konsistensi status pembayaran lintas role dashboard.

## Berjalan / Local-Compatible

- Admin operational package request fokus review minimal (status + estimasi + catatan).
- Visibility request paket customer (read-only history).

## Hold

- Convert package request ke order.
- Package payment/invoice production.
- Hard delete package/request.
- Super Admin flow final.
- Role management.
- Payment verification otomatis.
- Payment gateway / QRIS production.
- Upload bukti pembayaran production.
- Rekening/payment account integration production.
- Auth production (login/JWT/session/password/RBAC).
- Invoice/pajak production.
- Reporting engine/export production.

## Known Issue (Project-wide)

- `npm run check` sudah `0 errors` dan baseline warnings berkurang secara bertahap (a11y/css).
- Area warning tersisa:
  - `src/lib/components/ModalMenuDetail.svelte`
  - `src/routes/dashboard/admin/settings/+page.svelte`
  - `src/routes/dashboard/admin/tax/+page.svelte`
  - `src/routes/dashboard/admin/users/+page.svelte`
  - `src/routes/dashboard/cs/customers/+page.svelte`

## Roadmap Berikutnya

- Batch 16+: Super Admin local role management (tahap berikutnya).
- Batch 17+: Payment verification minimal (manual review enhancement).
- Batch 18+: Profile & Address management DB-backed.
