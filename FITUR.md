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
- Batch 16:
  - Customer Profile & Address Management ditambahkan sebagai simulasi lokal/clatiry.
  - Menegaskan status simulasi untuk Profile dan Alamat agar tidak menyesatkan sebagai data produksi.
- Batch 17:
  - Admin Users management diperjelas sebagai local user management simulation.
  - Role "Super Admin" dan "Admin" diperjelas batasan fungsionalitasnya di mode lokal.
- Batch 18:
  - Manual Payment Review UX ditingkatkan di dashboard Admin dan CS.
  - Penegasan alur verifikasi manual tanpa payment gateway otomatis.
- Batch 19:
  - Admin Reports dasar sudah DB-backed via `GET /api/orders`.
  - Ringkasan total revenue, total order, dan pending verification berbasis data riil database.

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
- Customer Profile & Address local simulation clarity.
- Admin Users local management clarity.
- Manual Payment Review enhancement (UX clarity).
- Admin Reports DB-backed basic summary.

## Berjalan / Local-Compatible

- Admin operational package request fokus review minimal (status + estimasi + catatan).
- Visibility request paket customer (read-only history).

## Hold

- Convert package request ke order.
- Package payment/invoice production.
- Hard delete package/request.
- Super Admin flow final (RBAC production).
- Role management production (JWT/Session).
- Payment verification otomatis.
- Payment gateway / QRIS production.
- Upload bukti pembayaran production.
- Rekening/payment account integration production.
- Auth production (login/JWT/session/password/RBAC).
- Invoice/pajak production.
- Reporting engine/export production (PDF/CSV).

## Known Issue (Project-wide)

- `npm run check` sudah `0 errors` dan baseline warnings berkurang secara bertahap (a11y/css).
- Area warning tersisa:
  - `src/lib/components/ModalMenuDetail.svelte` (A11y/div interactions)
  - `src/routes/dashboard/admin/users/+page.svelte` (A11y)
- Batch 20 telah melakukan pembersihan warning di:
  - `admin/settings` (aria-labels)
  - `admin/tax` (aria-labels)
  - `cs/customers` (label assoc)

## Roadmap Berikutnya

- Batch 21+: Stabilisasi Admin Operational (Package Request to Order Flow simulation).
- Batch 22+: Finalisasi local-development documentation & demo-ready polish.
