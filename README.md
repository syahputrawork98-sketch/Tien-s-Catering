# Tien's Catering

Tien's Catering adalah aplikasi pemesanan makanan/catering lokal untuk area Pemkot Cimahi.

## Target Penggunaan

- Pegawai/personal Pemkot Cimahi.
- Instansi/dinas/bidang di lingkungan Pemkot Cimahi.
- Publik/perusahaan luar (bertahap).

## Tech Stack

- SvelteKit
- Svelte
- Vite
- TailwindCSS
- SQLite lokal via SvelteKit API routes

## Status Project Saat Ini

- **Batch 70 — Operational Hardening Checkpoint**: Fase *Production Readiness* menuju *Production Candidate*. Telah menyelesaikan alur siklus pembayaran manual lengkap (Upload, Verifikasi, Penolakan, Unggah Ulang) dengan hardening keamanan UX.
- **Business-Ready / Production Candidate (Controlled Mode)**: Alur bisnis utama matang dengan penguncian keamanan tingkat server dan hardening operasional manual.
- **Development Persona Switcher**: Cara resmi untuk memilih akun/persona selama fase pengembangan ini.
- **Hold Production**: Fitur eksternal (Payment Gateway API, S3 Storage, Auth Production Final, e-Faktur Pajak) tetap ditahan.

## Struktur Folder Utama

- `apps/`: aplikasi utama SvelteKit (frontend + API route lokal).
- `Docs/project-control/`: Pusat kontrol resmi (Workflow, Status, Executor Rules).
- `Docs/`: dokumentasi aktif, arah produk, dan keputusan Room 00.

## Dokumentasi

- Ringkasan status fitur: `FITUR.md`
- Dokumentasi arah produk: `Docs/README.md`
