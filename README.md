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

- **Pre-Auth Local Development**: Fokus pada pengembangan alur bisnis menggunakan database SQLite lokal.
- **Developer Persona Switcher**: Digunakan sebagai mekanisme navigasi antar peran (Customer, CS, Admin) tanpa sistem login.
- **Hold Production**: Fitur sensitif (Auth, Real Payment Gateway, Official Tax) ditahan hingga fase final.
- Frontend + backend foundation sudah berjalan stabil di lingkungan lokal.

## Struktur Folder Utama

- `apps/`: aplikasi utama SvelteKit (frontend + API route lokal).
- `Docs/`: dokumentasi aktif, arah produk, dan keputusan Room 00.

## Dokumentasi

- Ringkasan status fitur: `FITUR.md`
- Dokumentasi arah produk: `Docs/README.md`
