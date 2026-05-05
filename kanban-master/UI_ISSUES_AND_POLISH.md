# UI Issues and Polish

Daftar hal yang perlu dirapikan untuk meningkatkan kualitas User Experience (UX) sebelum rilis produksi.

## A11y (Accessibility)
- [ ] Beberapa `label` pada form Dashboard Profile masih memerlukan `for` attribute (Target perbaikan berkelanjutan).
- [ ] Penambahan `aria-live` pada notifikasi add-to-cart agar terbaca screen reader.

## Mobile Responsiveness
- [ ] Tabel pada `/dashboard/admin/reports` memerlukan `overflow-x-auto` yang lebih mulus di layar sangat kecil (< 360px).
- [ ] Sidebar Dashboard harus otomatis tertutup (auto-close) setelah link navigasi diklik di perangkat mobile.

## Empty States
- [ ] Implementasi ilustrasi "Belum Ada Pesanan" di `/dashboard/orders`.
- [ ] Implementasi ilustrasi "Keranjang Kosong" di `CartDrawer` agar lebih menarik.
- [ ] Handle state jika hasil pencarian menu tidak ditemukan.

## Loading States
- [ ] Penambahan "Skeleton Screen" pada daftar menu di landing page saat transisi tanggal.
- [ ] Progress bar atau loading spinner saat transisi antar Dashboard Role.

## Placeholder Buttons
- [ ] Tombol "Cetak Bon" di Dashboard User masih berupa mock alert.
- [ ] Tombol "Export Report" di Dashboard Admin masih berupa mock alert.
- [ ] Tombol "Ubah Password" masih berupa placeholder fungsional.

## Copywriting
- [ ] Review seluruh teks brand lama vs "Tien's Catering" untuk konsistensi.
- [ ] Perbaikan pesan error pada form (Misal: "Format WhatsApp tidak valid").

## Visual Consistency
- [ ] Standarisasi radius sudut (`rounded-xl` vs `rounded-2xl` vs `rounded-[2.5rem]`).
- [ ] Konsistensi berat font (Black vs Extrabold) pada heading dashboard.

## Navigation Review
- [ ] Breadcrumbs pada dashboard untuk mempermudah navigasi di level yang lebih dalam (Misal: Dashboard > Orders > Detail).

## Future UX Improvements
- [ ] Fitur "Pesan Lagi" (Re-order) satu klik dari riwayat pesanan.
- [ ] Dark Mode support yang lebih merata di seluruh komponen dashboard (Beberapa border masih terlalu kontras di dark mode).
## Brand Consistency Check (Phase 2K/2L)
- [x] Public: `/`, `/katalog`, `/paket-catering`, `/tentang-kami`, `/kontak` (Tien's Catering)
- [x] Navbar: Login button contrast fix (Solid mode visibility)
- [x] Auth: `/login`, `/register` (Letter logo 'T')
- [x] Dashboard: Layout & Mobile Header (Letter logo 'T')
- [x] PDF Struk: Header "TIEN'S CATERING" & Alamat update
- [x] Mock Data: Order prefix `#TC` & Wedding package name
- [x] Metadata: Title tags & Meta descriptions on all public pages
