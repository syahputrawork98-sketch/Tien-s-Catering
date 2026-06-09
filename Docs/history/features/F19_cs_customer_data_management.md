# F19 — CS Customer Data Management

## Feature ID
F19

## Feature Name
CS Customer Data Management

## Status
Partially Found / Needs Follow-up Audit

## Scope
- Manajemen data pelanggan (customer) oleh Customer Service (CS) di dashboard.
- Fitur penayangan daftar pelanggan beserta identitas, nomor WhatsApp, alamat dinas pengantaran, dan status verifikasi registrasi.
- Aksi persetujuan (approval) atau penolakan (rejection) pendaftaran tipe akun instansi/perusahaan.
- Fitur pendaftaran akun manual (manual entry mode) oleh CS.
- Integrasi tombol pintas chat WhatsApp (WhatsApp quick link) ke kontak pelanggan.

## Files Inspected
- `apps/src/routes/dashboard/cs/customers/+page.svelte` (UI Halaman Kelola Data Customer CS)
- `apps/src/lib/config/navigation.ts` (Registrasi Menu Sidebar)
- `apps/src/routes/api/auth/me/+server.ts` (API Profile Pengguna - saat ini satu-satunya API terkait User)
- `apps/src/lib/server/services/authService.ts` (Service Autentikasi & Profil Pengguna)
- `apps/src/lib/server/repositories/userRepository.ts` (Repository SQLite Pengguna)
- `apps/src/lib/server/db/schema.ts` (Skema Tabel SQLite `users`)
- `apps/src/lib/mock/audit.ts` (Data Mock Audit Log)

## Feature Evidence Found

### UI Evidence
- Halaman utama CS Customer Management terletak di `apps/src/routes/dashboard/cs/customers/+page.svelte` dengan judul halaman **"Data Customer"**.
- Menyediakan tombol pintas **"Cek Pesanan CS"** untuk melompat ke daftar pesanan dan tombol **"Tambah Akun Manual"** dengan label *Manual Entry Mode (Local)*.
- Menampilkan widget statistik data pelanggan (total customer, tipe personal, instansi, dll).
- Memiliki fitur pencarian (*search*) reaktif di sisi client.
- Antarmuka terbagi menjadi tab: **"Konfirmasi User"**, **"User Personal"**, **"User Company"**, dan **"User Institusi"**.
- Menampilkan data dalam format tabel/grid yang memuat kolom: identitas customer, WhatsApp, lokasi utama, registrasi/aktivitas order, status/verifikasi, dan manajemen.
- Rincian kolom mencakup: nama, *account type* / *requested type*, sumber pembuatan akun, nomor WhatsApp, alamat, total order, tanggal order terakhir (*last order date*), status registrasi, *approvedBy*, *rejectedReason*, dan tombol aksi kelola/konfirmasi.
- Modal detail/approval customer menampilkan UID, label *Local Simulation View*, nama/instansi, WhatsApp, alamat pengiriman, aktivitas member, catatan internal CS, status registrasi, tombol aksi persetujuan/penolakan (approve/reject), serta tombol tutup detail.
- Modal tambah akun manual memuat isian: nama/instansi, WhatsApp, alamat, tipe akun member, status, dan catatan internal.
- UI halaman ini saat ini memuat data secara statis dari `mockCsCustomers` (berasal dari array `mockAccounts`).

### Route Evidence
- Rute `/dashboard/cs/customers` terdaftar di codebase melalui keberadaan berkas `apps/src/routes/dashboard/cs/customers/+page.svelte`.

### Navigation Evidence
- Pada berkas `apps/src/lib/config/navigation.ts`, navigasi peran CS (Customer Service) memiliki item **"Data Customer"** dengan `href: '/dashboard/cs/customers'` dan deskripsi *"Kelola data pelanggan dan instansi"*.
- Layout dashboard (`+layout.svelte`) memetakan peran CS ke peran navigasi `CUSTOMER_SERVICE` secara dinamis.

### Server/API Evidence
- Tidak ditemukan API endpoint backend yang melayani manajemen customer oleh CS seperti `GET /api/customers`, `GET /api/users`, `PATCH /api/customers/[id]`, atau `PATCH /api/users/[id]`.
- Tidak ditemukan backend endpoint untuk proses approval/rejection pendaftaran customer.
- Endpoint terkait pengguna yang ditemukan hanyalah `apps/src/routes/api/auth/me/+server.ts` yang menangani profile user yang sedang login saat ini (GET dan PATCH).
- Method `authService.updateProfile()` hanya mengizinkan modifikasi field terbatas (`name`, `phone`, `address`) milik diri sendiri.

### Database Evidence
- Skema database di `apps/src/lib/server/db/schema.ts` memiliki tabel **`users`** yang mendefinisikan field: `id`, `name`, `email`, `password_hash`, `role`, `phone`, `address`, `created_at`, `updated_at`.
- Berkas `apps/src/lib/server/repositories/userRepository.ts` memiliki method dasar: `findByEmail`, `findById`, `create`, dan `update`.
- Tidak ditemukan method untuk mengambil seluruh daftar pengguna (*list all customers*), penyaringan (*filter customer by role*), alur kerja verifikasi registrasi (*approval status*), atau statistik pesanan per customer.
- Kolom CRM dan approval yang dipakai di UI CS seperti `accountType`, `requestedType`, `registrationStatus`, `approvedBy`, `approvedAt`, `rejectedReason`, `internalNote`, `totalOrders`, dan `lastOrderDate` tidak didefinisikan dalam skema tabel `users` SQLite. Data tersebut hanya dideklarasikan pada model mock lokal frontend.

### Auth/Role Evidence
- Layout dashboard memiliki validasi pengalihan peran di sisi client (*client-side role redirect*).
- Tidak ditemukan role guard backend untuk pengamanan data customer list/detail/update karena endpoint API penulisan data customer untuk CS tidak ditemukan di backend.

### WhatsApp/Contact Integration Evidence
- Baris tabel data customer menyediakan tautan pintas WhatsApp ke nomor pelanggan dengan format: `href="https://wa.me/{customer.whatsapp}"` dengan atribut `target="_blank"` dan `rel="noopener noreferrer"`.
- Nomor WhatsApp yang sama juga dimuat di dalam modal detail customer. Tautan pintas ini langsung menggunakan variabel `customer.whatsapp` dari data mock tanpa proses normalisasi/sanitasi format nomor telepon internasional (misalnya mengubah `08...` atau `+62...` menjadi format string digital `62...` yang valid untuk `wa.me`).

### Audit Log Evidence
- Berkas mock `apps/src/lib/mock/audit.ts` memuat contoh riwayat audit simulasi UI-only terkait persetujuan dan penolakan akun customer oleh Admin/CS. Namun, aksi ini tidak mencatat log nyata ke backend atau tabel log database SQLite.

### Layout/Responsiveness Evidence
- Tabel customer menggunakan CSS wrapper `overflow-x-auto` dengan lebar minimum tabel `min-w-[1100px]`, sehingga pada perangkat berlayar kecil (mobile) tampilan tabel akan bergantung pada scrollbar horizontal secara penuh.
- Modal detail customer menggunakan lebar `w-full max-w-2xl` dengan tinggi konten `max-h-[60vh] overflow-y-auto` dan struktur grid 2 kolom. Tata letak grid 2 kolom ini berpotensi kurang rapi pada resolusi layar ponsel yang sempit karena tidak dilengkapi fallback responsif mobile (`grid-cols-1`).

## Current Implementation Summary
Fitur F19 berada dalam status **Partially Found / Needs Follow-up Audit**. Halaman antarmuka CS untuk mengelola customer (`/dashboard/cs/customers`) sudah terimplementasi secara visual dengan fitur yang sangat memadai (pencarian, tab kategori member, statistik, modal detail approval, dan form input manual). Namun, fitur ini masih bertindak sebagai simulasi murni (*frontend-only/mock-driven*). Seluruh data diambil dari berkas mock lokal `mockCsCustomers`, dan aksi interaktif seperti menyetujui, menolak, atau mendaftarkan akun manual hanya memutasi status lokal frontend sementara. Di sisi backend, belum ada endpoint API pendukung manajemen customer, tabel `users` di database SQLite belum memiliki kolom CRM/Approval yang diperlukan oleh UI, dan repositori backend belum mendukung kueri manipulasi data user untuk peran CS.

## Functional Flow Observed
1. **Pemuatan Halaman Customer**: CS membuka halaman `/dashboard/cs/customers` $\rightarrow$ frontend memuat array data dari `mockCsCustomers` secara lokal $\rightarrow$ merender data ke tabel dan menghitung ringkasan statistik (tanpa memanggil API backend).
2. **Aksi Approval/Pendaftaran Akun**: CS menekan tombol setujui/tolak registrasi atau menyimpan form tambah akun baru $\rightarrow$ frontend mengubah state array lokal dan langsung menampilkan alert sukses simulasi $\rightarrow$ data yang diubah atau ditambahkan langsung terhapus saat halaman di-refresh.

## Gaps / Missing Parts
1. **Sumber Data Mock (Statis)**: Data customer masih berupa mock lokal, bukan dari database SQLite melalui API.
2. **Ketiadaan API Endpoint Pengelolaan**: Tidak ada endpoint API seperti `/api/customers` atau `/api/users` untuk melayani pengambilan data daftar customer, rincian detail, maupun update status approval khusus CS.
3. **Skema DB Belum Siap (CRM Fields)**: Tabel `users` belum memiliki kolom CRM & Approval penting: `registrationStatus`, `accountType`, `requestedType`, `approvedBy`, `approvedAt`, `rejectedReason`, `internalNote`, `totalOrders`, dan `lastOrderDate`.
4. **Otorisasi Backend Belum Ada**: Tidak ada role guard backend ADMIN/CS untuk melindungi data list/update customer.
5. **Aksi Tidak Persist**: Aksi approve/reject dan pendaftaran akun manual hanya memutasi memori lokal frontend dan tidak tersimpan ke SQLite.
6. **Kurangnya Normalisasi Nomor WhatsApp**: Tautan pintas WhatsApp langsung memasukkan data input mentah tanpa normalisasi format (seperti mengganti `08` ke `62` atau membuang karakter non-digit), yang berpotensi memicu error link rusak jika nomor yang dimasukkan customer tidak sesuai format web WhatsApp.
7. **Simulasi Riwayat Order**: Data order total dan tanggal order terakhir hanya diambil dari properti statis, belum dihitung berdasarkan relasi transaksi riil di tabel `orders`.
8. **Kebocoran Data Sensitif**: Belum ada mekanisme pembatasan visual/sensor data sensitif customer (seperti email/alamat) di sisi backend sebelum data dikirimkan ke CS.
9. **Simulasi Audit Log**: Aktivitas pendaftaran dan verifikasi akun belum mencatat log audit nyata ke database.
10. **Tampilan Mobile Tidak Optimal**: Tabel menggunakan lebar statis `min-w-[1100px]` yang memaksa scroll horizontal pada layar kecil, dan modal detail 2 kolom tidak memiliki penyesuaian otomatis menjadi 1 kolom untuk kenyamanan membaca di mobile.

## Risk Notes
- **Kesalahan Operasional CS**: CS dapat mengira pendaftaran instansi baru telah disetujui karena tombol approval sukses mengubah status di layar, padahal customer di database SQLite masih berstatus belum diverifikasi dan tidak dapat bertransaksi.
- **Kerusakan Link WhatsApp**: Jika customer menginput WhatsApp dengan format `0812-xxxx-xxxx` atau `+62...`, tautan pintas WhatsApp dapat mengarahkan CS ke halaman error WhatsApp web karena format nomor tidak disanitasi menjadi deretan angka numerik murni.

## Suggested Status
**Partially Found / Needs Follow-up Audit** (Kerangka UI lengkap namun integrasi API, modifikasi skema tabel SQLite, serta persistensi data approval dan registrasi akun manual belum terimplementasi sama sekali di backend).

## Recommendation / Next Step
1. Perluas skema tabel `users` di `schema.ts` SQLite untuk mengakomodasi kolom CRM dan status approval (`registration_status`, `account_type`, `requested_type`, `approved_by`, `internal_note`, dll).
2. Hubungkan data aktivitas transaksi (`totalOrders`, `lastOrderDate`) dengan melakukan kueri agregasi `COUNT` dan `MAX` ke tabel `orders`.
3. Implementasikan API backend `GET /api/customers` (dengan role guard CS/ADMIN) untuk mengambil list user dengan role `CUSTOMER` dari database.
4. Implementasikan API backend `PATCH /api/customers/[id]/approve` dan `PATCH /api/customers/[id]/reject` untuk menangani approval status.
5. Hubungkan tombol-tombol aksi pada UI `/dashboard/cs/customers/+page.svelte` ke endpoint-endpoint API backend tersebut.
6. Terapkan sanitasi nomor WhatsApp di frontend/backend sebelum merendernya ke link pintas `wa.me`.
7. Sesuaikan CSS modal detail customer menggunakan class Tailwind responsif (misalnya `grid-cols-1 md:grid-cols-2`) agar layout form tersusun vertikal pada layar mobile.
