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
- `converted_to_order` disiapkan sebagai arah, tetapi aksi convert masih Hold.

## Endpoint Tersedia

- `GET /api/packages`
- `POST /api/package-requests`
- `GET /api/package-requests`
- `PATCH /api/package-requests/[id]/status`

## Fitur Hold

- Convert package request to order.
- Admin package CRUD.
- Super Admin package management.
- Package payment/invoice.
- Package masuk checkout/cart.
- Upload bukti pembayaran/payment gateway.
- Auth/RBAC production.

## Roadmap Berikutnya

- Admin Package CRUD Minimal.
- User Dashboard DB untuk history order/request.
- Super Admin local role management (tahap berikutnya).
