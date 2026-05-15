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

- **Batch 60 — Fase E Checkpoint**: Fase *Production Readiness* menuju *Production Candidate*. Telah menyelesaikan Auth Foundation, Security Guard Hardening, Data Isolation, dan Manual Payment Settings (QRIS/Bank).
- **Business-Ready / Production Candidate (Controlled Mode)**: Alur bisnis utama matang dengan penguncian keamanan tingkat server.
- **Development Persona Switcher**: Cara resmi untuk memilih akun/persona selama fase pengembangan ini.
- **Hold Production**: Fitur eksternal (Payment Gateway API, S3 Storage, Auth Production Final) tetap ditahan.

## Struktur Folder Utama

- `apps/`: aplikasi utama SvelteKit (frontend + API route lokal).
- `Docs/project-control/`: Pusat kontrol resmi (Workflow, Status, Executor Rules).
- `Docs/`: dokumentasi aktif, arah produk, dan keputusan Room 00.

## Dokumentasi

- Ringkasan status fitur: `FITUR.md`
- Dokumentasi arah produk: `Docs/README.md`
