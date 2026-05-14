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
- **Business-Complete (Pre-Auth)**: Alur bisnis utama stabil.
- **Developer Persona Switcher**: Dipertahankan sebagai mode simulasi dengan label transparan berdampingan dengan Auth Produksi.
- **Hold Production**: Fitur sensitif (Payment Gateway, S3 Storage, Super Admin, Deployment) tetap ditahan.

## Struktur Folder Utama

- `apps/`: aplikasi utama SvelteKit (frontend + API route lokal).
- `Docs/`: dokumentasi aktif, arah produk, dan keputusan Room 00.

## Dokumentasi

- Ringkasan status fitur: `FITUR.md`
- Dokumentasi arah produk: `Docs/README.md`
