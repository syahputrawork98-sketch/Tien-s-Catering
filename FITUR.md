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
- [x] **Batch 42**: Admin Order Monitoring & Payment Verification Polish. (Selesai)
- [x] **Batch 41**: Reporting Revenue Logic Advanced (Deep Analytics). (Selesai)
- [x] **Batch 40**: Invoice Print/PDF Polish (Commercial Invoice styling). (Selesai)
- [x] **Batch 39**: Reporting + Export Foundation Polish. (Selesai)
- [x] **Batch 37**: Commercial Invoice Basic (Print-friendly).
- [x] **Batch 35**: Admin Payment Verification (Manual).
- [x] **Batch 34**: Payment Proof Upload (Local Storage).
- **Admin**: Order management (List, Detail, Status update, Payment status manual), Package management, Package Request review (Review, Status, Notes), Commercial Invoice Basic, Reports summary (Revenue, Orders, Finance), User Management (Development mode).
- **CS**: Dashboard orders & customers handling clarity.
- **Foundation**: Local backend active (`/api/health`, `/api/menus`, `/api/orders`, `/api/packages`, `/api/package-requests`).
- **Security**: Server-side role guards (Batch 53/55), Ownership isolation (Batch 56), 401 Unauthorized handling (Batch 57/58).
- **Integration**: Convert Package Request to Order (Admin-driven), Source metadata tracking.

- [x] **Batch 43**: Admin Customer Management Overview Polish. (Selesai)
- [x] **Batch 44**: Local Deployment Readiness & Build Hygiene. (Selesai)
- [x] **Batch 45**: Pre-Auth Production Readiness Checklist. (Selesai)
- [x] **Batch 46**: Developer Persona Account Selector (Multi-account simulation). (Selesai)
- [x] **Batch 47**: Final Fase A–D Handover + Health Check. (Selesai)
- [x] **Batch 48**: Fase E Opening & Production Gap Audit. (Selesai)
- [x] **Batch 49**: Minimal Auth Foundation (Register/Login API + UI). (Selesai)
- [x] **Batch 50**: Auth Session Hardening + Basic Dashboard Guard. (Selesai)
- [x] **Batch 51**: Account/Profile + Customer Data Isolation foundation. (Selesai)
- [x] **Batch 52**: Basic Role Access Guard client-side. (Selesai)
- [x] **Batch 53**: Server-side/API role guard foundation. (Selesai)
- [x] **Batch 54**: Docs Sync Ringan Fase E Auth Progress. (Selesai)
- [x] **Batch 55**: API Guard Completion & Ownership Visibility. (Selesai)
- [x] **Batch 56**: Ownership & Data Isolation Polish. (Selesai)
- [x] **Batch 57**: Session Cleanup & Unauthorized Handling. (Selesai)
- [x] **Batch 58**: Role Flow Regression & Guard Consistency Polish. (Selesai)
- [x] **Batch 59**: Payment Setting QRIS & Bank Account. (Selesai)
- [x] **Batch 60**: Docs Sync + Handoff Room Baru. (Selesai)
- [x] **Batch 61**: Official Internal Invoice / Commercial Billing. (Selesai)
- [x] **Batch 62**: Admin Operational Monitoring Foundation. (Selesai)
- [x] **Batch 63**: Operational Monitoring Data Honesty & Error State Polish. (Selesai)
- [x] **Batch 64**: Operational Monitor to Admin Orders Handoff Polish. (Selesai)
- [x] **Batch 65**: Docs Sync project-control (Batch 61-64). (Selesai)
- [x] **Batch 66**: Admin Orders Filter Safety & Operational Hardening. (Selesai)
- [x] **Batch 67**: Manual Payment Verification Safety Polish (Admin). (Selesai)
- [x] **Batch 68**: Customer Payment Status & Reupload Guidance Polish. (Selesai)
- [x] **Batch 69**: Rejected Payment Proof Reupload Flow Polish (Customer). (Selesai)
- [x] **Batch 70**: Docs Sync Project Progress (Batch 65-70). (Selesai)

## 3. Production-Ready Features
*Fitur bisnis yang dikembangkan dengan logika produksi.*

- **Official Internal Invoice**: Commercial billing document dengan instruksi pembayaran manual QRIS/Bank (Batch 61).
- **Admin Operational Monitor**: Real-time summary cards, needs attention list, dan recent activity (Batch 62).
- **Data Honesty Guard**: Dashboard monitoring dengan proteksi terhadap kegagalan API/koneksi (Batch 63).
- **Handoff Actionability**: Navigasi terintegrasi dari Dashboard Monitor ke halaman Orders dengan query filter divalidasi (Batch 64-66).
- **Payment Verification Guard**: Dialog konfirmasi, billing summary, dan safety microcopy pada proses verifikasi manual Admin (Batch 67).
- **Customer Payment Guidance**: Panduan visual status pembayaran, microcopy manual verification, dan reupload guidance untuk bukti ditolak (Batch 68-69).
- **Payment Account**: Konfigurasi nomor rekening/tujuan transfer lokal (Admin) — `system_settings` SQLite.
- **Advanced Reporting**: Grafik tren bulanan/tahunan berbasis data SQLite.
- **Bulk Operations**: Update status order masal atau export data transaksi.
- **Super Admin Control**: Kontrol pengaturan sistem global/pajak secara fungsional.
- **Feedback System**: Customer feedback/review lokal setelah order selesai.

## 4. Hold Production / Phase E Focus
*Ditahan hingga dibuka di Fase E (Batch 48+) atau keputusan Room 00.*

- **Auth Production**: Foundation selesai (Batch 49-53). Sisa: Security hardening, JWT/Production Auth, Lupa Password.
- **RBAC Final**: Penguncian hak akses tingkat server (Security hardening).
- **Payment Gateway**: Integrasi QRIS Real, Webhook Midtrans, atau API pihak ketiga.
- **Legal/Tax**: e-Faktur resmi pemerintah (Batch 61 tetap Commercial Billing).
- **Storage Final**: S3/Cloud storage untuk upload (saat ini masih local folder).
- **Deployment**: Final production hardening, SSL, & server setup.
- **Backup Monitor**: Monitoring infrastruktur/backup real-time.

## 5. Future / Nanti
- Package public checkout (Direct checkout tanpa request).
- Hard delete data sensitif (Saat ini hanya status/soft delete).
- Real-time notification (WebSocket/Push).

---

## Catatan Scope & Policy
- Project berada dalam fase **Production Readiness**.
- **Development Persona Switcher** digunakan sebagai cara resmi memilih akun/persona.
- Dokumentasi kontrol resmi di `Docs/project-control/`.
- Dokumentasi aktif lainnya di `Docs/`, `FITUR.md`, dan `README.md`.
- Tracking lama dari `kanban-master/` sudah diserap/ditutup.

## Known Issue (Project-wide)
- `npm run check` sudah `0 errors`.
- Area warning tersisa: `src/lib/components/ModalMenuDetail.svelte` (A11y).
- Label "Local SQLite Database Simulation" sudah distandardisasi di seluruh aplikasi.
