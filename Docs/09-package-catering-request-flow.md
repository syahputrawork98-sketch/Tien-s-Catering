# Package Catering Request Flow - TC / Tien's Catering

## Prinsip Utama

- Paket Catering berjalan dengan konsep **by request**.
- Paket tidak checkout instan.
- Paket tidak masuk cart.
- Paket tidak langsung masuk orders menu harian.
- Harga paket menggunakan konsep **"Mulai Dari"** dan dikonfirmasi admin setelah review request.

## Perbedaan Paket vs Menu Harian

- Menu harian: alur cepat katalog -> cart -> checkout -> order.
- Paket catering: alur konsultatif katalog paket -> ajukan request -> review admin.
- Paket dipakai untuk kebutuhan acara/rapat dengan variabel pax, lokasi, dan kebutuhan khusus.

## Alur Public Package

1. User membuka `/paket-catering`.
2. Halaman membaca data paket dari `GET /api/packages`.
3. Jika API gagal, halaman fallback ke mock package agar UI tetap tampil.
4. User membuka detail paket dan melihat informasi:
   - harga mulai dari,
   - minimal pax,
   - item paket,
   - fitur,
   - suitable for.
5. User mengisi form **Ajukan Request Paket**.
6. Submit request dikirim ke `POST /api/package-requests`.

## Alur Request Paket

1. Public submit request paket.
2. Backend menyimpan request ke tabel `package_requests`.
3. Request memiliki nomor request dan status awal `new`.
4. Request tetap berdiri sendiri, belum menjadi order.

## Alur Admin Review Minimal

1. Admin membuka `/dashboard/admin/package-requests`.
2. Halaman membaca list request dari `GET /api/package-requests`.
3. Admin melakukan review minimal:
   - update status request,
   - isi estimasi harga manual,
   - isi catatan admin.
4. Update review dikirim ke `PATCH /api/package-requests/[id]/status`.

## Status Request Paket

- `new`
- `reviewing`
- `quoted`
- `rejected`
- `cancelled`
- `converted_to_order`: aksi convert dilakukan secara manual oleh admin setelah negosiasi selesai.

## Endpoint Tersedia

- `GET /api/packages`
- `POST /api/package-requests`
- `GET /api/package-requests`
- `PATCH /api/package-requests/[id]/status`

## Status Implemented

- Admin package management aktif di `/dashboard/admin/packages` (CRUD + Multiple Images).
- Admin package request review aktif di `/dashboard/admin/package-requests` (Status, Estimasi, Catatan).
- Customer package request visibility aktif di `/dashboard/package-requests` (History + Progress Timeline).
- Sinkronisasi data riil via `GET/POST/PATCH /api/package-requests`.

## Data/Flow yang Masih Mock atau Hold

- **Hold Production / Final**:
  - Payment gateway production (QRIS Real/API).
  - Auth production (Login/JWT/Session/RBAC Final).
  - Invoice & Pajak riil (e-Faktur).
  - Deployment hardening final.
- **Local-Compatible (Active/Planned)**:
  - Convert package request ke order (**Active**).
  - Payment verification manual (**Active**).
  - Export CSV/PDF basic (**Planned/Ready**).
- **Future**: Hard delete package/request.

## Roadmap Berikutnya

- Batch 31-35: Tahap Evaluasi Final & Persiapan Serah Terima (Handover).
- Batch 36+: Final Simulation of Advanced Admin Features (Inventory/Suppliers).
