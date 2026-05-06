# Backend Not Started

Dokumen ini menyatakan secara tegas bahwa pengembangan sisi server untuk versi baru Tien's Catering **belum dimulai**. Seluruh fungsionalitas saat ini murni berbasis frontend.

## Current Rule (ATURAN KERAS)
- **NO MIGRATION**: Jangan pindahkan kode backend, controller, atau database schema dari repositori lama secara mentah-mentah.
- **NO DATABASE**: Jangan menginstal database driver atau library ORM sebelum desain skema disetujui.
- **NO AUTH SERVER**: Jangan mengimplementasikan Auth.js atau sistem login server-side dulu.
- **NO API ROUTES**: Jangan membuat file `+server.ts` atau endpoint API.

## Current Data Mode
Aplikasi beroperasi menggunakan:
- **Menu Data**: Mock Static File.
- **Session/Role**: Client-side State & `localStorage`.
- **Cart**: `localStorage`.
- **Checkout**: Frontend-only logic.
- **Persistence**: Tidak ada persistensi data di sisi server.
- **Payment Proof**: Upload bukti pembayaran murni simulasi UI-only (Base64/Local State).
- **Payment Accounts**: Data rekening murni mock (Local State).
- **Audit Logs**: Pencatatan aktivitas murni simulasi di sisi client.

## What Does Not Exist Yet
Daftar fitur backend yang **HARUS** dibangun di fase berikutnya:
1. **Real Authentication**: Sistem login berbasis nomor telepon & password (dengan hashing).
2. **Real Authorization**: RBAC (Role Based Access Control) yang diverifikasi di sisi server.
3. **Menu Persistence**: CRUD menu yang tersimpan di database.
4. **Order Engine**: Validasi stok, pembuatan ID pesanan unik, dan penyimpanan transaksi.
5. **Customer Database**: Manajemen data pelanggan real.
6. **Financial Aggregation**: Perhitungan laporan admin berbasis data transaksi nyata.

## Future Backend Rebirth (Phase 4 Plan)
Backend baru akan dirancang dengan prinsip:
1. **Drizzle ORM**: Untuk manajemen skema database yang type-safe.
2. **PostgreSQL**: Sebagai database relasional utama.
3. **Auth.js (NextAuth)**: Untuk integrasi sistem autentikasi yang aman.
4. **Server Actions**: Menggunakan fitur SvelteKit Actions untuk interaksi form yang efisien.

## Backend Candidate Domains
Domain data yang akan didefinisikan:
- `users` & `roles`
- `customers` & `addresses`
- `menus` & `categories`
- `orders` & `order_items`
- `payments` & `notifications`
- `audit_logs`

**Status Saat Ini**: ❌ Belum Siap (Menunggu Persetujuan Dokumentasi Kanban Master).
