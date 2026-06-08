# F13 — Customer Address Management

## Feature Type
Customer

## Discovery Source
- **Customer Addresses Page**: `apps/src/routes/dashboard/addresses/+page.svelte`
- **Navigation Configuration**: `apps/src/lib/config/navigation.ts`
- **Mock Data**: `apps/src/lib/mock/user.ts`

## Current Status
Found / Needs Functional Validation

## What Exists
1. **Frontend-Only Address Management Page**:
   - Halaman `/dashboard/addresses` menyediakan antarmuka bagi customer untuk mengelola alamat pengiriman katering mereka secara simulasi lokal.
   - Merender daftar alamat tersimpan dalam bentuk kartu berisi: Label Alamat (Rumah, Kantor, dll.), Nama Penerima, WhatsApp Penerima, Alamat Lengkap, dan petunjuk visual "Alamat Utama" jika alamat tersebut diset default.
   - **Tindakan/Aksi CRUD Lokal**:
     - **Tambah Alamat**: Menampilkan dialog modal formulir tambah dengan isian Label, Nama Penerima, WhatsApp, Alamat Lengkap, dan checkbox Jadikan Alamat Utama. ID alamat baru digenerasi via `Math.random().toString(36).substr(2, 9)`.
     - **Edit Alamat**: Memuat data alamat terpilih ke dalam dialog modal untuk diedit.
     - **Hapus Alamat**: Menghapus data alamat dari state lokal pasca konfirmasi browser (`confirm`).
     - **Set Sebagai Utama**: Mengubah alamat default secara eksklusif (mereset alamat lain menjadi non-default).
   - **Visual Guidance & Microcopy**:
     - Menampilkan info banner biru di bagian bawah yang memperingatkan customer bahwa: *"Dataset alamat ini dikelola secara frontend-only untuk kebutuhan demo navigasi dan checkout. Penambahan atau perubahan alamat tidak akan tersimpan secara permanen jika halaman di-refresh sepenuhnya. Shipping engine backend saat ini masih dalam status Hold Production."*
     - Banner indikator sukses hijau kecil (`✓ Berhasil`) muncul sesaat di pojok kanan atas setelah aksi simpan/set default/hapus berhasil dieksekusi.
2. **Dashboard Navigation Integration**:
   - Rute `/dashboard/addresses` terdaftar secara resmi di sidebar menu navigasi role `USER` di `navigation.ts` dengan label `"Alamat Saya"`.

## API & Backend Status
- **API Paths**: Tidak ada API endpoint/route (`+server.ts`) yang melayani operasi CRUD alamat di repositori saat ini.
- **Database Status**: Tidak ada tabel data khusus alamat (seperti `user_addresses` atau sejenisnya) di dalam skema database SQLite `apps/src/lib/server/db/schema.ts`. Data informasi alamat pengiriman pesanan hanya disimpan secara lepas per transaksi di tabel `delivery_info` (kolom `address_summary`, `department_or_unit`, `floor`, `location_note`).

## Main User Flow
$$\text{Navigasi Dashboard ("Alamat Saya")} \longrightarrow \text{addresses/+page.svelte} \longleftarrow \text{Inisialisasi state via mockUserAddresses}$$
$$\text{addresses/+page.svelte} \longrightarrow \text{Aksi CRUD (Tambah/Edit/Set Default/Hapus)} \longrightarrow \text{Mutasi Array state 'addresses'} \longrightarrow \text{Visual Alert Sukses (3 detik)}$$

## Integration & Mock Data Notes
- **Mock Data Source**: State awal alamat (`addresses`) dimuat langsung dari konstanta array `mockUserAddresses` di berkas `apps/src/lib/mock/user.ts`.
- **Checkout Flow Integration Gap**: Meskipun terdapat fitur manajemen alamat di dashboard, **halaman checkout (`/checkout`) tidak menggunakan data alamat dari dashboard addresses sama sekali**. Checkout memaksa pengisian alamat pengiriman Pemkot Cimahi secara manual via kolom teks instansi (department/unit), lantai (floor), dan catatan lokasi (location note).
- **No Persistence**: Karena dikelola secara lokal pada state Svelte `$state([...mockUserAddresses])` di tingkat komponen, seluruh penambahan/perubahan data alamat akan langsung hilang kembali ke state bawaan mock jika halaman browser di-refresh sepenuhnya.

## Gaps / Needs Functional Validation
- **No Persistence to SQLite**: Tidak adanya sinkronisasi penyimpanan data alamat ke SQLite database (status shipping engine backend masih **Hold Production**).
- **Missing Integration in Checkout**: Ketiadaan opsi dropdown/card selector alamat utama untuk prefill alamat di halaman checkout katering.

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
