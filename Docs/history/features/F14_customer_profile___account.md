# F14 — Customer Profile / Account

## Feature Type
Customer

## Feature Summary
Fitur **F14 — Customer Profile / Account** menyediakan antarmuka bagi customer untuk melihat dan memperbarui informasi data diri mereka (Nama Lengkap, WhatsApp, Alamat Utama) serta mengelola keamanan dasar seperti simulasi ubah password akun.

## Current Status
Found / Needs Functional Validation

## Confirmed Source Paths

### 1. Frontend & UI Paths
* **Customer Profile Page**: `apps/src/routes/dashboard/profile/+page.svelte`
* **Layout & Navigation Sidebar**: `apps/src/routes/dashboard/+layout.svelte`
* **Navigation Config**: `apps/src/lib/config/navigation.ts`
* **Client Auth Store**: `apps/src/lib/stores/auth.svelte.ts`
* **Client Auth Service**: `apps/src/lib/services/auth.ts`

### 2. Backend & API Paths
* **Auth Me Endpoint**: `apps/src/routes/api/auth/me/+server.ts`
* **Backend Auth Service**: `apps/src/lib/server/services/authService.ts`
* **User Repository Layer**: `apps/src/lib/server/repositories/userRepository.ts`

### 3. Database & Data Model
* **Database Schema File**: `apps/src/lib/server/db/schema.ts` (Tabel `users` SQL)
* **SQLite Client Helper**: `apps/src/lib/server/db/client.ts`

## Confirmed Database Schema
Data profil tersimpan langsung secara permanen di tabel `users`. Tidak ada tabel database eksternal khusus profil.

**Tabel `users`**:
* `id` (TEXT PRIMARY KEY): UUID pengguna.
* `name` (TEXT NOT NULL): Nama lengkap pengguna.
* `email` (TEXT NOT NULL UNIQUE): Identitas login pengguna (read-only pada form profile).
* `password_hash` (TEXT NOT NULL): Password hash bcrypt (tidak dikirim ke frontend).
* `role` (TEXT NOT NULL DEFAULT 'CUSTOMER'): Hak akses sistem (CUSTOMER, CS, ADMIN).
* `phone` (TEXT): Nomor WhatsApp/kontak customer.
* `address` (TEXT): Alamat utama default customer.
* `created_at` (TEXT NOT NULL): Tanggal pendaftaran.
* `updated_at` (TEXT NOT NULL): Tanggal pembaruan profil terakhir.

## Main User Flow
1. **Pemuatan Profil**:
   $$\text{Akses /dashboard/profile} \longrightarrow \text{authStore.init()} \longrightarrow \text{GET /api/auth/me} \longrightarrow \text{Kueri userRepository.findById} \longrightarrow \text{Tampilkan Data Profil}$$
2. **Pembaruan Profil (Production Mode)**:
   $$\text{Input Form} \longrightarrow \text{Tombol Simpan} \longrightarrow \text{PATCH /api/auth/me} \longrightarrow \text{authService.updateProfile} \longrightarrow \text{UPDATE users di SQLite} \longrightarrow \text{Alert Sukses}$$
3. **Pembaruan Password (Simulasi)**:
   $$\text{Modal Ubah Password} \longrightarrow \text{Input Form} \longrightarrow \text{Validasi Input Frontend} \longrightarrow \text{Sukses Simulasi (500ms Delay)} \longrightarrow \text{Alert Sukses}$$

## UI States & Action Notes
* **Local Simulation Mode vs Production Mode**:
  * Ketika masuk ke dashboard via **Persona Mode** (`tiens_persona_mode` di localStorage), status akun bertuliskan *"Active Persona (Demo)"* dan terdapat banner kuning *"Mode Simulasi (Persona)"*.
  * Ketika masuk via akun **Production** resmi, header menuliskan *"Authenticated Account"*.
  * Pada halaman `/dashboard/profile`, banner bertuliskan *"Local Simulation Mode. Perubahan hanya tersimpan di memori browser lokal"* dan tombol bertuliskan *"Simpan Simulasi"*.
  * **Gap Teknis Penting**: Logika `handleSave` pada baris `+page.svelte` mengecek `if (!authStore.isAuthenticated) return;`. Jadi, jika customer masuk dalam mode simulasi persona, tombol "Simpan" sama sekali tidak akan berjalan. Sementara jika mereka terautentikasi (Production Mode), tombol tersebut **BENAR-BENAR menyimpan data secara permanen ke database SQLite**. Label *"Simpan Simulasi"* dan microcopy demo memicu misinterpretasi bagi user/developer.
* **Read-only Email**:
  * Input Email di-set `readonly` dan `cursor-not-allowed` untuk mencegah penggantian email login utama secara bebas di sisi client.
* **Ubah Password Keamanan (Simulasi)**:
  * Aksi *"Ubah Password"* memicu modal berisi isian current password, new password, dan confirm password.
  * Fitur ini masih bersifat simulasi frontend murni. Tidak ada endpoint API `/api/auth/change-password` yang dipanggil. Perubahan data password lama dan baru hanya divalidasi secara client-side, lalu menampilkan notifikasi sukses hijau tiruan.

## Auth & Session Integration
* **Sesi Cookie**:
  * Otentikasi didasarkan pada cookie `session_token` yang diverifikasi melalui tabel `sessions` di SQLite.
  * Halaman `/dashboard/profile` dilindungi di level layout (`+layout.svelte`) yang memaksa redirect ke `/login?error=auth_required` apabila user tidak terotentikasi dan tidak dalam Persona Mode.
* **Ownership Isolation**:
  * Endpoint `PATCH /api/auth/me` mendapatkan user ID langsung dari `session_token` cookie yang terotentikasi:
    ```typescript
    const user = await authService.validateSession(token);
    // user.id digunakan secara langsung untuk update
    const updatedUser = await authService.updateProfile(user.id, data);
    ```
    Hal ini menjamin isolasi kepemilikan yang kuat, di mana customer hanya diizinkan memodifikasi baris data profil milik mereka sendiri dan tidak dapat memanipulasi profil customer lain.

## Integration & Side Effects
* **Dashboard Header & Sidebar Sync**:
  * Nama dan role pengguna yang ditampilkan pada sidebar di `+layout.svelte` terikat secara reaktif dengan state `authStore.user`. Setelah pembaruan profil berhasil disimpan ke database dan state `authStore.user` dimutasi, nama pengguna di sidebar akan ter-update secara otomatis tanpa membutuhkan reload halaman penuh.
* **Checkout & Order History De-coupling**:
  * Skema database transaksi katering (`orders` dan `package_requests`) menyimpan informasi `customer_name` dan `whatsapp` secara statis per baris transaksi (flat).
  * Dampaknya, modifikasi nama/WhatsApp pada profil pengguna **tidak berdampak retroaktif** terhadap pesanan atau pengajuan request paket katering yang sudah dikirimkan di masa lampau.

## Gaps / Needs Functional Validation
* **Visual vs Logic Discrepancy**: Banner halaman profil menuliskan *"Mode demo: Perubahan hanya tersimpan di memori browser lokal. Simpan Simulasi"*, padahal secara kode untuk akun terotentikasi, data sebenarnya dikirim ke API `PATCH /api/auth/me` dan tersimpan ke file SQLite secara permanen. Hal ini perlu diperjelas di visual UI jika fitur sudah dilepas ke production.
* **Simulated Password Change**: Perubahan password di modal masih bersifat tiruan di frontend dan belum terintegrasi ke SQLite.
* **Simulated Delete Account**: Tombol "Hapus Akun" hanya memicu dialog alert simulasi: *"Simulasi: Akun katering Anda dijadwalkan untuk penghapusan (Hold Production)."* tanpa ada mekanisme penghapusan data riil di database.

## Do Not Touch Yet
* No implementation, modification, or refactoring in this audit-only task.
