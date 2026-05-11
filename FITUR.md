## Status Order & Dashboard Batch (Accepted)

- Batch 21:
  - Package Request Operational Completion: Admin dapat melakukan review (status, estimasi harga, catatan admin) via `PATCH /api/package-requests`.
  - Sinkronisasi data request paket antara Customer dan Admin dashboard.
- Batch 22:
  - Customer Dashboard Home Summary (`/dashboard`) aktif.
  - Menampilkan ringkasan pesanan aktif, total transaksi, dan status request paket terbaru dari database.
- Batch 23:
  - CS Customer Handling Clarity ditingkatkan pada `/dashboard/cs/customers`.
  - Penambahan label simulasi lokal dan filter pencarian pelanggan yang lebih informatif.
- Batch 24:
  - Admin Settings / Tax / Payment Config Clarity.
  - Penegasan status "Hold Production" pada area konfigurasi sensitif untuk mencegah kebingungan demo.
- Batch 25:
  - Public Menu Detail Polish & A11y.
  - Peningkatan aksesibilitas dan transisi visual pada modal detail menu.
- Batch 26:
  - Admin Reports Phase 2 (Local Summary).
  - Laporan penjualan, pesanan, dan keuangan kini terintegrasi dengan database SQLite lokal (`GET /api/orders`).
  - Pembedaan jelas antara data riil database dan data simulasi visual (tren/grafik).
- Batch 27:
  - Customer Profile & Address Local CRUD Polish.
  - Peningkatan UX untuk pengeditan profil dan alamat dalam mode simulasi lokal.
- Batch 28:
  - Admin Users Local Simulation Phase 2.
  - Peningkatan manajemen user admin dengan summary cards, search/filter, dan penegasan status RBAC Hold.
- Batch 29:
  - End-to-End Demo Flow Polish.
  - Penyelarasan alur navigasi dari publik (order success) ke dashboard operasional.
  - Standardisasi label "Local SQLite Database Simulation" di seluruh dashboard.

## Selesai

- Public katalog membaca menu dari API (`GET /api/menus`).
- Cart sudah stock-aware (batas qty mengikuti stok).
- Checkout submit order ke API (`POST /api/orders`).
- Order tersimpan ke database SQLite lokal.
- Order-success menampilkan response order API + link ke dashboard.
- Admin order list dan order detail membaca database (`GET /api/orders`).
- Admin update status order minimal aktif (`PATCH /api/orders/[id]/status`).
- Admin update payment status manual aktif (`PATCH /api/orders/[id]/payment-status`).
- Transaksi stok aktif (Stock-aware operations).
- Local backend foundation aktif (`/api/health`, `/api/menus`, `/api/orders`, `/api/package-requests`).
- Public `/paket-catering` membaca package API (`GET /api/packages`).
- Admin package management `/dashboard/admin/packages` aktif.
- Admin package request review aktif (status, estimasi, catatan).
- Customer dashboard orders & summary DB-backed (`/dashboard`).
- CS dashboard orders & customers handling clarity.
- Admin Reports DB-backed summary (Revenue, Orders, Finance).
- Customer Profile & Address local simulation.
- Admin Users management local simulation.
- End-to-End demo flow consistency (Public -> Customer -> Admin/CS).

## Berjalan / Local-Compatible

- Seluruh operasional dashboard (Orders, Packages, Reports) berjalan di atas SQLite lokal.
- Simulasi CRUD lokal untuk profil, alamat, dan user admin.

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

- `npm run check` sudah `0 errors` dan baseline warnings berkurang secara bertahap.
- Area warning tersisa:
  - `src/lib/components/ModalMenuDetail.svelte` (A11y click/key events)
- Batch 29 telah menstandardisasi label "Local SQLite Database Simulation" di seluruh aplikasi.

## Roadmap Berikutnya

- Batch 31-35: Tahap Evaluasi Final & Persiapan Serah Terima (Handover).
- Batch 36+: Final Simulation of Advanced Admin Features (Inventory/Suppliers).
