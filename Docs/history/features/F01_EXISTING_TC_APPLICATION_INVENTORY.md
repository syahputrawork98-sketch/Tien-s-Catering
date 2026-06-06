# F01 — Existing TC Application Inventory

## Feature Summary
Inventory aplikasi TC yang sudah berjalan sebelum feature tracker F02 dan seterusnya diaktifkan.

## Status
Executed / Under Review

## Story
TC adalah existing project. Sebelum fitur public, customer, admin, payment, reporting, security, dan production readiness dikunci dalam tracker resmi, kondisi aplikasi harus diaudit berdasarkan repo.

## Current State
Inventory telah dilakukan (Batch F01A).

## Root & App Structure Inventory
- **Framework Utama:** SvelteKit (Vite + TypeScript)
- **Styling:** TailwindCSS 4 (`@tailwindcss/vite`)
- **Folder Aplikasi:** `apps/`
- **Frontend / Routes:** `apps/src/routes/` (memuat halaman public seperti `katalog`, `paket-catering`, `login`, `register`, `checkout`, dan halaman private seperti `dashboard`, `admin`, `cs`).
- **Backend / API:** `apps/src/routes/api/` (memuat endpoints untuk `auth`, `health`, `menus`, `orders`, `packages`, `reports`, dll). Logika server berada di `apps/src/lib/server/`.
- **Database:** `better-sqlite3` dengan struktur yang dikelola di `apps/src/lib/server/db/`.
- **Auth & Security:** Menggunakan `bcryptjs` dengan routes `api/auth` dan pages `login`/`register`.
- **Reporting:** Menggunakan `jspdf` dan `jspdf-autotable` untuk export PDF, dengan folder `invoice/` dan `api/reports/`.

## Mapping F00–F08

| Feature | Kategori | Penjelasan / Temuan |
|---|---|---|
| **F00** — Workflow / setup / adoption | Working / Stable | Struktur kontrol Docs sudah selesai dan aktif. |
| **F01** — Existing application inventory | Working / Stable | Laporan inventory awal telah dibuat. |
| **F02** — Public menu & ordering | Existing but Partial | Ditemukan `routes/katalog`, `routes/paket-catering`, dan `api/menus`. Belum tervalidasi fungsionalitas akhirnya. |
| **F03** — Cart, checkout & order flow | Existing but Partial | Ditemukan `routes/checkout`, `routes/order-success`, dan `api/orders`. |
| **F04** — Admin order management | Existing but Partial | Ditemukan `routes/dashboard/admin/orders`, `routes/dashboard/orders`, `api/orders`. Terdapat UI untuk admin. |
| **F05** — Payment verification | Existing but Partial | Belum ditemukan modul payment gateway khusus secara root eksplisit, tetapi tercakup dalam alur checkout/order. Perlu Room 01 Review saat dibuka. |
| **F06** — Reporting, invoice & export | Existing but Partial | Ditemukan `routes/invoice`, `routes/dashboard/admin/reports`, `api/reports`, serta package `jspdf`. |
| **F07** — Role, permission & security | Existing but Partial / HOLD Production | Ditemukan integrasi auth dan modul users. Menyentuh auth & role, berstatus HOLD. |
| **F08** — Production readiness | Not Found / Not Checked | Belum ada tanda-tanda konfigurasi deployment khusus (Dockerfile/docker-compose) di tingkat root. HOLD Production. |

## Sub-Batch Roadmap
- F01A — Existing TC Application Inventory (Selesai)
- F01B — Sync Current Status and Feature History (Next step)

## HOLD / Blocked Notes
No application change is allowed during inventory. Area auth, database, payment, security, dan production readiness tetap berstatus HOLD.

## Validation Checklist
- [x] Root structure checked
- [x] Docs structure checked
- [x] apps/ structure checked without modification
- [x] package scripts checked
- [x] feature evidence listed
- [x] risk areas classified
- [x] no application code changed
