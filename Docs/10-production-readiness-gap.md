# 10 - Production Readiness Gap Audit

Dokumen ini mencatat selisih (gap) antara kondisi **Local Business-Complete** (Batch 47) dengan kondisi **Production Candidate** (Target Batch 60).

## 1. Fitur Utama dalam Status "Hold Production"
Fitur-fitur ini sudah diidentifikasi sebagai penghambat utama rilis publik dan membutuhkan penanganan khusus di Fase E.

| Fitur | Status Saat Ini | Kebutuhan Produksi |
|---|---|---|
| **Authentication** | Foundation Active (Batch 49-53) | Lupa Password, Email Verif, Strict JWT, Secure Cookies |
| **RBAC** | Partial (Client/API Guard Active) | Middleware protection, Complex Role Matrix |
| **Payment Gateway** | Manual Transfer (Admin Config Active) | Integrasi Midtrans/Xendit, QRIS Real, Webhooks (Hold) |
| **Storage** | Local Folder (`/uploads`) | Cloud Storage (AWS S3 / Google Cloud Storage / Supabase) |
| **Security Hardening** | Open API (No validation/auth) | Rate limiting, CORS, Input sanitization, Helmet |
| **Export PDF/CSV** | Client-side simulation | Server-side secure generation |
| **Package Workflow** | Local Manual | Automated "Package to Order" & restricted cart/checkout logic |
| **Deployment** | Local Run (`npm run dev`) | VPS/Cloud Hosting, SSL (HTTPS), CI/CD, Env management |

## 2. Gap Fungsional & Bisnis
Beberapa alur bisnis masih bersifat "Happy Path" lokal.

- **Account Management**: Belum ada fitur Lupa Password, Verifikasi Email, atau Update Profil dengan validasi session.
- **Super Admin Panel**: Role Super Admin belum memiliki kendali penuh atas manajemen user produksi dan konfigurasi sistem global.
- **Role Management**: Penugasan role ke user baru belum memiliki workflow pendaftaran yang aman.
- **Package Request to Order**: Transisi status dan notifikasi otomatis masih sangat minimal/manual.
- **Package Cart/Checkout**: Alur paket masuk cart/checkout/order tetap ditahan (Hold) kecuali dibuka secara eksplisit untuk skenario tertentu.
- **Invoice & Pajak**: Format invoice saat ini baru bersifat "Commercial" sederhana, belum memenuhi standar e-Faktur atau integrasi perpajakan resmi.
- **Export Data**: Fitur export PDF/CSV masih bersifat client-side simulation, perlu dipindahkan ke server-side untuk data besar dan keamanan.

## 3. Infrastruktur & DevOps
- **Database**: Menggunakan SQLite lokal. Perlu diputuskan apakah tetap SQLite (dengan backup) atau migrasi ke PostgreSQL untuk skalabilitas produksi.
- **Environment Variables**: Penanganan `.env` harus diperketat (pemisahan dev/prod secrets).
- **Logging & Monitoring**: Belum ada sistem logging (seperti Winston/Pino) atau monitoring error (seperti Sentry).

## 4. Risiko & Mitigasi
- **Data Migration**: Migrasi dari akun persona simulasi ke akun user riil berisiko kehilangan data transaksi jika tidak dipetakan dengan baik.
- **Storage Migration**: Bukti pembayaran yang saat ini tersimpan lokal harus dimigrasikan ke cloud saat sistem live.

---
*Terakhir diupdate: Batch 60 — Docs Sync + Handoff Room Baru*
