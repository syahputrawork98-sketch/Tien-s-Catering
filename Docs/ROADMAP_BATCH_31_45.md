# Roadmap Batch 31–45: Fase A–D Pre-Auth Production Readiness

## A. Ringkasan Keputusan Room 00

Berdasarkan diskusi dan rekomendasi dari Room 01, Room 00 menyetujui percepatan pengembangan Project TC (Tien's Catering) dengan fokus pada **Pre-Auth Production Readiness**.

Keputusan utama:
1. **Fokus Alur Bisnis**: TC masuk ke fase di mana fitur bisnis utama (Order Management, Payment Proof, Invoicing, Reporting) akan diimplementasikan dengan standar *production-style*, namun tetap dalam lingkungan *pre-auth*.
2. **Penundaan Fase E**: Implementasi sistem keamanan produksi final (Auth, JWT, Session, Password Management, RBAC, Super Admin Final) ditunda hingga Fase E (Batch 46+).
3. **Developer Persona Switcher**: Tetap dipertahankan sebagai mekanisme navigasi antar peran (Customer, CS, Admin) untuk mempermudah pengecekan dan pengujian fungsionalitas bisnis secara cepat.
4. **Roadmap Terintegrasi**: Roadmap dipadatkan hingga Batch 45 untuk memastikan fase A–D selesai dengan *health check* yang solid sebelum melangkah ke pengamanan sistem.

## B. Batasan Scope

Batch 31–45 **TIDAK** mencakup fitur-fitur berikut (HOLD hingga Fase E):
- **Production Accounts**: Tidak ada sistem login/register dengan password database.
- **Security Layers**: Tidak ada JWT, Session management, atau server-side route protection final.
- **RBAC**: Hak akses berbasis peran (Admin/CS/User) belum dikunci secara sistem keamanan produksi.
- **Payment Gateway Real**: Tidak ada integrasi webhook atau API payment gateway pihak ketiga (hanya simulasi verifikasi bukti transfer).
- **Official e-Faktur**: Belum mencakup integrasi sistem perpajakan resmi pemerintah.
- **Final Hardening**: Belum mencakup security hardening untuk deployment produksi final.

## C. Roadmap Batch 31–45

### Fase A — Package to Order
- **Batch 31**: Dokumentasi / Roadmap Freeze Fase A–D (Selesai).
- **Batch 32**: Package Request to Order Foundation (Selesai).
- **Batch 33**: Package Order Visibility Customer/CS/Admin (Selesai).

### Fase B — Payment Proof + Invoice
- **Batch 34**: Payment Proof Upload Storage Foundation (Selesai).
- **Batch 35**: Admin Payment Verification Workflow (Selesai).
- **Batch 36**: **Checkpoint 1** — Package + Payment Proof Integration Check (Selesai).
- **Batch 37**: Commercial Invoice Basic (Selesai).
- **Batch 38**: **Fase A & B Documentation & Stabilization Wrap-up** (Selesai).

### Fase C — Reporting + Export
- **Batch 39**: Reporting + Export Foundation Polish (Selesai).
- **Batch 40**: Invoice Print/PDF Polish (Selesai).
- **Batch 41**: Reporting Revenue Logic Advanced (Selesai).
- **Batch 42**: **Checkpoint 2** — Payment + Invoice + Reporting Export Check (Selesai).

### Fase D — Deployment Readiness
- **Batch 43**: Admin Customer Management Polish (Selesai).
- **Batch 44**: Local Deployment Readiness & Build Hygiene (Selesai).
- **Batch 45**: Pre-Auth Production Readiness Checklist (Selesai).
- **Batch 46**: Pre-Handover Fix: Developer Persona Account Selector (Selesai).
- **Batch 47**: **Final Fase A–D Handover + Health Check** (Selesai).

## D. Checkpoint Policy

Untuk menjaga efisiensi pengembangan, pengecekan sistem secara menyeluruh (QA besar) hanya dilakukan pada batch-batch berikut:
1. **Batch 36**: Integrasi Package Request ke Order dan verifikasi pembayaran.
2. **Batch 41**: Integrasi Invoice dan Reporting Engine dengan data riil.
3. **Batch 45**: Finalisasi Fase A–D dan kesiapan menuju Fase E.

## E. Pre-Auth Production Readiness Checklist (Batch 45)

Berikut adalah checklist final untuk memastikan aplikasi siap dalam mode **Pre-Auth Local Development**:

### 1. Technical Health
- [x] **npm run check**: Bersih (0 errors, 0 warnings di area aktif).
- [x] **npm run build**: Berhasil dijalankan secara lokal (Success).
- [x] **Local API Foundation**: Endpoint `/api/orders`, `/api/reports`, `/api/menus`, `/api/packages` stabil.
- [x] **SQLite Integrity**: Skema database lokal mendukung seluruh alur bisnis yang diimplementasikan.

### 2. Functional Readiness (Business Flow)
- [x] **Public Catalog**: API Menu & Paket aktif.
- [x] **Ordering Flow**: Checkout ke database lokal berhasil.
- [x] **Admin Orders**: Manajemen status dan mutasi stok aktif.
- [x] **Payment Proof**: Sistem upload lokal dan verifikasi manual aktif.
- [x] **Reporting**: Export CSV berbasis data riil SQLite aktif.
- [x] **Invoicing**: Tampilan Commercial Invoice Basic siap cetak.
- [x] **Customer Management**: Approval dan klasifikasi tipe akun aktif.

### 3. Documentation & Governance
- [x] **Persona Switcher**: Terpasang jelas sebagai navigasi peran (Customer, CS, Admin).
- [x] **Hold Production**: Seluruh fitur sensitif (Auth/Payment/Legal) terdokumentasi sebagai **HOLD**.
- [x] **Terminology**: Penggunaan istilah "Local Simulation" dan "Pre-Auth" konsisten.
- [x] **Source of Truth**: README, FITUR, dan Docs sudah sinkron.

## F. Final Handover & Health Check (Batch 47)

Fase A–D (Batch 31–47) dinyatakan **Selesai** dengan status **Business-Complete (Pre-Auth)**.

### 1. Pencapaian Utama
- **End-to-End Local Flow**: Aplikasi sudah bisa mensimulasikan seluruh proses bisnis mulai dari request paket, konversi ke order, checkout katalog, upload bukti bayar, hingga reporting keuangan.
- **Developer Persona Switcher + Account Selector**: Alat bantu simulasi multi-role yang kuat untuk demo tanpa sistem auth produksi.
- **Build Hygiene**: Standardisasi kode yang menghasilkan 0 errors pada `svelte-check` dan build yang valid.

### 2. Catatan Risiko Tersisa
- **Identity Simulation Only**: Persona Selector (Batch 46) adalah simulasi identitas berbasis localStorage, bukan sistem keamanan (auth/RBAC) riil.
- **Data Isolation**: Data di dashboard admin dan customer bersifat global/transaksional; isolasi data tingkat baris (row-level isolation) per customer belum diimplementasikan secara ketat karena ketiadaan sistem User ID produksi.
- **Manual Verification**: Alur pembayaran masih mengandalkan verifikasi manual (Hold Payment Gateway).

### 3. Fase E Transition: Next Step
Project siap melangkah ke Fase E (Batch 48+) yang akan berfokus pada:
- Implementasi sistem Auth (Login/Register).
- Keamanan Route & API (JWT/Session).
- Final Production Hardening & Deployment.
