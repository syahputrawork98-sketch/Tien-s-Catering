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

- **Batch 54 — Fase E Active**: Fase *Production Readiness*. Saat ini fokus pada dokumentasi sinkronisasi progres Auth Foundation (Session hardening, Data isolation, Server-side role guard).
- **Business-Ready / Production Readiness**: Alur bisnis utama stabil dan diarahkan menuju kesiapan produksi.
- **Development Persona Switcher**: Cara resmi untuk memilih akun/persona selama fase pengembangan ini.
- **Hold Production**: Fitur sensitif (Payment Gateway, S3 Storage, Super Admin, Deployment) tetap ditahan.

## Struktur Folder Utama

- `apps/`: aplikasi utama SvelteKit (frontend + API route lokal).
- `Docs/project-control/`: Pusat kontrol resmi (Workflow, Status, Executor Rules).
- `Docs/`: dokumentasi aktif, arah produk, dan keputusan Room 00.

## Dokumentasi

- Ringkasan status fitur: `FITUR.md`
- Dokumentasi arah produk: `Docs/README.md`
