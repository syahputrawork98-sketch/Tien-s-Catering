# Status Fitur & Scopeboard TC

## Status Order & Dashboard Batch (Accepted)

- Batch 21: Package Request Operational Completion.
- Batch 22: Customer Dashboard Home Summary.
- Batch 23: CS Customer Handling Clarity.
- Batch 24: Admin Settings / Tax / Payment Config Clarity.
- Batch 25: Public Menu Detail Polish & A11y.
- Batch 26: Admin Reports Phase 2 (Local Summary).
- Batch 27: Customer Profile & Address Local CRUD Polish.
- Batch 28: Admin Users Local Simulation Phase 2.
- Batch 29: End-to-End Demo Flow Polish.

---

## 1. Done / Selesai
*Fitur yang sudah aktif di database SQLite lokal.*

- **Public**: Katalog menu (API), Cart stock-aware, Checkout order, Order-success response, Public `/paket-catering` (API).
- **Customer**: Dashboard home summary, Order list, Profile/Address local CRUD, Payment Proof Upload (local storage).
- **Admin**: Order management (List, Detail, Status update, Payment status manual), Package management, Package Request review (Review, Status, Notes), Commercial Invoice Basic, Reports summary (Revenue, Orders, Finance), Users local simulation.
- **CS**: Dashboard orders & customers handling clarity.
- **Foundation**: Local backend active (`/api/health`, `/api/menus`, `/api/orders`, `/api/packages`, `/api/package-requests`).
- **Integration**: Convert Package Request to Order (Admin-driven), Source metadata tracking.

## 2. Ready for Batch
*Fitur yang siap dikerjakan dalam waktu dekat.*

- **Batch 39**: Invoice Print/PDF Polish + Order Export Basic.
- **Batch 40**: Reporting Revenue Logic Phase 3.
- **Batch 41**: Reports Export CSV/PDF Basic.

## 3. Local-Compatible / Bisa Dikerjakan
*Fitur bisnis yang bisa dikembangkan secara lokal (Pre-Auth).*

- **Payment Account**: Konfigurasi nomor rekening/tujuan transfer lokal (Admin).
- **Advanced Reporting**: Grafik tren bulanan/tahunan berbasis data SQLite.
- **Bulk Operations**: Update status order masal atau export data transaksi.
- **Super Admin Simulation**: Simulasi pengaturan sistem global/pajak lokal.
- **Feedback System**: Customer feedback/review lokal setelah order selesai.

## 4. Hold Production / Final
*Ditahan hingga Fase E (Batch 46+) atau keputusan Room 00.*

- **Auth Production**: Login, Register, Password, JWT, Session.
- **RBAC Final**: Penguncian hak akses tingkat server (Security hardening).
- **Payment Gateway**: Integrasi QRIS Real, Webhook Midtrans, atau API pihak ketiga.
- **Legal/Tax**: e-Faktur resmi, integrasi perpajakan pemerintah.
- **Storage Final**: S3/Cloud storage untuk upload (saat ini masih local folder).
- **Deployment**: Final production hardening, SSL, & server setup.

## 5. Future / Nanti
- Package public checkout (Direct checkout tanpa request).
- Hard delete data sensitif (Saat ini hanya status/soft delete).
- Real-time notification (WebSocket/Push).

---

## Catatan Scope & Policy
- Project berjalan dalam mode **Pre-Auth Local Development**.
- **Developer Persona Switcher** tetap digunakan untuk demo dan pengujian.
- Dokumentasi aktif hanya di `Docs/`, `FITUR.md`, dan `README.md`.
- Tracking lama dari `kanban-master/` sudah diserap/ditutup.

## Known Issue (Project-wide)
- `npm run check` sudah `0 errors`.
- Area warning tersisa: `src/lib/components/ModalMenuDetail.svelte` (A11y).
- Label "Local SQLite Database Simulation" sudah distandardisasi di seluruh aplikasi.
