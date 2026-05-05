# Frontend Atomic Checklist

## Public Area

### `/` (Home Ringkas)
- [x] Full-screen Hero section dengan background image premium
- [x] Branding "Tien's Catering" dominan
- [x] CTA Utama: Paket Catering & Lihat Menu
- [x] Minimal Footer (Home-specific)
- [x] Navbar: Dinamis (Transparent on Home, Solid after scroll)

### `/katalog` (Menu Live)
- [x] Date scroller fungsional
- [x] Katalog menu menampilkan `MenuCard`
- [x] Badge stok & integrasi `CartDrawer`
- [x] **Detail Modal**: Muncul saat klik Lihat Detail / Pesan Sekarang dengan quantity selector

### `/paket-catering`
- [x] Daftar paket (Nasi Box, Snack, dll)
- [x] Detail fitur tiap paket
- [x] **Detail Modal**: Muncul saat klik Detail dengan info benefit lengkap
- [x] CTA Konsultasi / Login

### `/tentang-kami`
- [x] Story & Values
- [x] Statistik pencapaian brand
- [x] Area layanan informasi

### `/kontak`
- [x] Informasi kontak (WA/Email)
- [x] Form Konsultasi (UI-only)
- [x] Google Maps Placeholder UI

### `/login`
- [x] Route fungsional
- [x] Form login (Phone & Password) fungsional UI
- [x] Quick Login / Demo Access (Admin, CS, User)
- [x] Redirect otomatis sesuai Role yang dipilih
- [x] Integrasi dengan `mockSession` store
- [x] Link ke registrasi
- [x] Tombol "Lupa Kata Sandi" (Mock Alert)

### `/register`
- [x] Route fungsional
- [x] Form pendaftaran lengkap
- [x] Simulasi loading saat submit
- [x] Alert sukses simulasi
- [x] Link ke login

### `/checkout`
- [x] Route fungsional
- [x] Ringkasan keranjang tampil
- [x] Form informasi pengiriman (Nama, WA, Alamat)
- [x] Form tanggal pengiriman
- [x] Perhitungan total otomatis
- [x] Tombol submit mengarahkan ke `/order-success`
- [x] Persistensi data order ke `sessionStorage`

### `/order-success`
- [x] Route fungsional
- [x] Animasi sukses
- [x] Menampilkan data order dari `sessionStorage`
- [x] Tombol kembali ke Dashboard

## Customer Dashboard

### `/dashboard` (Home)
- [x] Ringkasan status akun
- [x] Navigasi cepat ke pesanan terakhir
- [x] Info promo/banner (UI Only)

### `/dashboard/orders`
- [x] Daftar riwayat pesanan (Cards)
- [x] Badge status pesanan (Submitted, Delivered, dll)
- [x] Badge status pembayaran
- [x] Tombol cetak bon (Mock)

### `/dashboard/addresses`
- [x] Daftar alamat tersimpan
- [x] Badge "Alamat Default"
- [x] Fitur tambah/hapus alamat (Local state)
- [x] Fitur set default (Local state)

### `/dashboard/profile`
- [x] Form edit data pribadi
- [x] Info keanggotaan (Premium/Personal)
- [x] Simulasi ubah password

## CS Dashboard

### `/dashboard/cs` (Home)
- [x] Statistik pesanan harian (Mock)
- [x] Grafik performa (UI Placeholder)

### `/dashboard/cs/orders`
- [x] Tabel monitoring pesanan masuk
- [x] Filter status pesanan
- [x] Tombol aksi (Konfirmasi, Detail) simulasi

### `/dashboard/cs/menu`
- [x] Daftar menu harian
- [x] Toggle ketersediaan stok (On/Off fungsional local)
- [x] Edit harga/label stok simulasi

### `/dashboard/cs/customers`
- [x] Direktori data pelanggan
- [x] Klasifikasi tipe (Company/Personal)
- [x] Riwayat total transaksi per customer

## Admin Dashboard

### `/dashboard/admin` (Home)
- [x] Metrik utama (Revenue, Orders, Customers)
- [x] Indikator tren kenaikan/penurunan

### `/dashboard/admin/reports`
- [x] Tabel laporan mingguan
- [x] Ringkasan Gross Profit
- [x] Identifikasi Menu Terlaris

### `/dashboard/admin/users`
- [x] Manajemen akun karyawan
- [x] Filter role & status login terakhir
- [x] Toggle aktif/nonaktif akun

### `/dashboard/admin/settings`
- [x] Pengaturan identitas bisnis
- [x] Konfigurasi notifikasi
- [x] Status sistem (Maintenance mode toggle)

## Shared UI & Logic

### Global
- [x] **Public Navbar**: Kontras dinamis (Solid pada halaman selain Home, Login button diperbaiki).
- [x] **Cart Drawer**: Global access, quantity update, item removal.
- [x] **Unified Dashboard Layout**: Responsive sidebar, role-based menu.
- [x] **Role Switcher**: Dev tool untuk pindah role instan.
- [x] **Mock Session Store**: State management role di localStorage.
- [x] **Navigation Config**: Centralized mapping role-to-routes.

### Accessibility (A11y)
- [x] ARIA labels pada tombol utama
- [x] Form label associations (Target 2J)
- [x] Semantic HTML (h1-h3)

## Polish & Future Review
- [ ] Implementasi Real Auth (Tahap 4)
- [ ] Implementasi Real Database (Tahap 4)
- [ ] Loading skeletons untuk transisi halaman
- [ ] Validasi form yang lebih ketat (Regex WA, dll)
- [ ] Penanganan state kosong (Empty orders, Empty menu)
