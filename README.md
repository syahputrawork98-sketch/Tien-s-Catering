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

- **Batch 48 — Fase E Active**: Memasuki fase *Production Readiness*. Fokus pada penutupan gap keamanan, auth, dan infrastruktur.
- **Business-Complete (Pre-Auth)**: Alur bisnis utama sudah selesai dan stabil untuk simulasi lokal (Batch 47).
- **Developer Persona Switcher**: Masih digunakan untuk demo multi-role hingga sistem Auth produksi diimplementasikan di Batch 49.
- **Hold Production**: Fitur sensitif (Real Payment Gateway, Cloud Storage, Deployment) tetap ditahan mengikuti roadmap Fase E.

## Struktur Folder Utama

- `apps/`: aplikasi utama SvelteKit (frontend + API route lokal).
- `Docs/`: dokumentasi aktif, arah produk, dan keputusan Room 00.

## Dokumentasi

- Ringkasan status fitur: `FITUR.md`
- Dokumentasi arah produk: `Docs/README.md`
