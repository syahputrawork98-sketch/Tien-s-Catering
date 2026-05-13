# 02 - Current Repo State

## Ringkasan Kondisi Repo Saat Ini

- Repo fokus pada fungsionalitas bisnis (Pre-Auth mode).
- `apps/` adalah aplikasi utama (SvelteKit + local API routes).
- Project menggunakan **Developer Persona Switcher** untuk simulasi multi-role.
- Penyimpanan data menggunakan **SQLite Lokal**.

## Status Teknis Saat Ini

- Local backend foundation sudah aktif.
- SQLite lokal dipakai untuk data operasional:
  - persona dev,
  - menu + daily stock,
  - orders + order_items + delivery_info + payment_info,
  - customer registration status.
- Public katalog membaca data menu dari API (`GET /api/menus`).
- Checkout menulis order ke API (`POST /api/orders`).
- Admin area (Orders, Reports, Customers) membaca dan menulis ke database via API lokal.
- Auth masih simulasi/dev persona switcher (belum auth production).
- Payment gateway masih dalam mode simulasi bukti transfer (Hold Production).
- Stock management (decrement/restore) sudah aktif dalam alur konfirmasi/pembatalan order.

## Deployment Readiness Status (Batch 44)

- **Build Hygiene**: `npm run check` sudah bersih (0 errors, 0 warnings) untuk area aktif.
- **Build Success**: `npm run build` berhasil dijalankan secara lokal menggunakan adapter-auto.
- **Routing Safety**: Jalur navigasi dashboard admin dan customer telah diverifikasi, termasuk perbaikan fallback UI untuk data kosong.
- **Hold for Production**: Deployment production riil masih ditahan (Hold) menunggu Fase E (Auth & Security).

## Catatan Arah Dokumen

`Docs/`, `FITUR.md`, dan `README.md` aktif adalah source of truth arah produk dan status repo.
Keputusan terbaru Room Chat 00 menjadi acuan utama.
