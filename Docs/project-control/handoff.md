# Handoff Room Chat Baru

## Konteks Ekosistem
- **Project**: TC / Tien’s Catering.
- **Status**: Production Candidate (Controlled Mode).
- **Mekanisme**: Development Persona Switcher / Account Selector (Orchestrator Utama).
- **Source of Truth**: GitHub & `Docs/project-control/`.
- **Commit Terakhir**: `114f4acf13812c08f980938032b17b77bd0d0ca7` (Verifikasi di Git).

## Peran & Tanggung Jawab
1. **Room 00**: Pengambil keputusan final, penentu scope, prioritas, dan evaluasi hasil.
2. **Room 01**: Analisa mendalam, perancangan arsitektur, dan mitigasi risiko teknis.
3. **Gemini 3 Flash**: Executor murni. Fokus pada implementasi kode sesuai instruksi Room 00/01.

## Status Batch
- **Batch Terakhir (Accepted)**: Batch 59 (Payment Setting QRIS & Bank Account).
- **Batch Aktif (Checkpoint)**: Batch 60 (Docs Sync + Handoff).
- **Batch Berikutnya (Target Room Baru)**: Batch 61 (Official Internal Invoice / Commercial Billing).

## Keputusan Scope Owner (Fixed Boundaries)
- ✅ **Akses**: Ready produksi menggunakan Development Persona Switcher.
- ✅ **Pembayaran**: Manual QRIS & Bank Transfer (Upload Bukti + Verifikasi Manual).
- ❌ **Hold**: Payment Gateway API (Midtrans/Xendit), Cloud Storage (S3), Deployment Live, Auth Production Final (JWT/Social), Email Verification, e-Faktur Pajak Pemerintah.
- 💡 **Ready Scope**: Invoice/Faktur internal, Monitoring operasional internal.

## Ringkasan Teknis Terakhir
1. **Security**: `authGuard.ts` dan `requireRole` sudah memproteksi seluruh endpoint mutasi sensitif.
2. **Data Isolation**: Pesanan dan data customer sudah terisolasi berdasarkan `userId`.
3. **Payment Config**: Menggunakan tabel `system_settings` di SQLite untuk menyimpan QRIS (Base64) dan rekening bank yang dikelola Admin.
4. **UX**: Penanganan session expired (401) sudah terintegrasi di seluruh dashboard utama.

## Prompt Pembuka Room Baru (Saran)
> "Saya berpindah dari Room Chat sebelumnya. Project: Tien's Catering (TC). Status: Production Candidate (Controlled Mode) dengan Development Persona Switcher. Batch terakhir yang diselesaikan adalah Batch 60 (Docs Sync). Rujukan utama Anda adalah `Docs/project-control/`. Mari mulai dengan Batch 61: Perancangan Invoice Resmi Internal."