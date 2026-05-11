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
- **Batch 32**: Package Request to Order Foundation (Konversi permintaan paket menjadi pesanan aktif).
- **Batch 33**: Package Order Visibility (Visibilitas alur pesanan paket di sisi Customer/CS/Admin).

### Fase B — Payment Proof + Invoice
- **Batch 34**: Payment Proof Upload Storage Foundation (Simulasi penyimpanan bukti bayar lokal).
- **Batch 35**: Admin Payment Verification Workflow (Proses verifikasi bukti bayar oleh Admin).
- **Batch 36**: **Checkpoint 1** — Package + Payment Proof Integration Check.
- **Batch 37**: Commercial Invoice Basic (Pembuatan invoice komersial dasar).

### Fase C — Reporting + Export
- **Batch 38**: Invoice Print/PDF Polish + Order Export Basic.
- **Batch 39**: Reporting Revenue Logic Phase 3 (Logika pendapatan berdasarkan pesanan riil & terverifikasi).
- **Batch 40**: Reports Export CSV/PDF Basic.
- **Batch 41**: **Checkpoint 2** — Payment + Invoice + Reporting Export Check.

### Fase D — Deployment Readiness
- **Batch 42**: Deployment Config & Env Readiness.
- **Batch 43**: Upload Storage & Database Deployment Notes.
- **Batch 44**: Pre-Auth Production Readiness Checklist.
- **Batch 45**: **Final Fase A–D Handover + Health Check**.

## D. Checkpoint Policy

Untuk menjaga efisiensi pengembangan, pengecekan sistem secara menyeluruh (QA besar) hanya dilakukan pada batch-batch berikut:
1. **Batch 36**: Integrasi Package Request ke Order dan verifikasi pembayaran.
2. **Batch 41**: Integrasi Invoice dan Reporting Engine dengan data riil.
3. **Batch 45**: Finalisasi Fase A–D dan kesiapan menuju Fase E.

## E. Batch 32 Next Action

**Batch 32 — Package Request to Order Foundation**

Fokus eksekusi:
- Membangun logika konversi dari `Package Request` (status: `quoted`) menjadi `Order` baru melalui panel Admin.
- Data `Order` hasil konversi harus masuk ke endpoint `GET /api/orders`.
- `Package Request` yang telah dikonversi akan mendapatkan status `converted_to_order` dengan relasi ID Order yang tercipta.
- Order baru akan memiliki status awal `new` dan status pembayaran `unpaid`.
- Fitur ini belum mencakup *public checkout* untuk paket, fokus pada *admin-driven conversion*.
