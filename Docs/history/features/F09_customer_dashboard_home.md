# F09 — Customer Dashboard Home

## Feature Type
Customer

## Discovery Source
- **Layout Page**: `apps/src/routes/dashboard/+layout.svelte` *(Sidebar navigation & role guard)*
- **Dashboard Home Page**: `apps/src/routes/dashboard/+page.svelte` *(Customer stats & shortcuts)*
- **API Endpoints**: 
  - `apps/src/routes/api/orders/+server.ts` *(GET)*
  - `apps/src/routes/api/package-requests/+server.ts` *(GET)*
- **Service & Utilities**:
  - `apps/src/lib/server/services/orderService.ts`
  - `apps/src/lib/server/services/packageRequestService.ts`
  - `apps/src/lib/server/utils/authGuard.ts`
- **Database Tables**:
  - `orders` in `apps/src/lib/server/db/schema.ts`
  - `package_requests` in `apps/src/lib/server/db/schema.ts`
  - `users` in `apps/src/lib/server/db/schema.ts`

## Current Status
Found / Needs Functional Validation

## Technical Findings & Audit Summary

### 1. Dashboard Route Structure
- **Main Route**: `/dashboard` yang ditangani oleh berkas `apps/src/routes/dashboard/+page.svelte`.
- **Layout**: Mewarisi layout pembungkus `apps/src/routes/dashboard/+layout.svelte` yang menyediakan sidebar navigasi desktop, header mobile (hamburger menu), serta data user active info.
- **Child Routes**: 
  - `/dashboard/orders` (Semua Pesanan / F10)
  - `/dashboard/package-requests` (Request Paket / F12)
  - `/dashboard/profile` (Profil Saya / F14)
  - `/dashboard/addresses` (Daftar Alamat / F13)

### 2. Dashboard UI Content
- **Welcome Message**: Dinamis menyapa pengguna dengan `"Halo, [Nama Depan]! 👋"` yang bersumber dari `authStore.user?.name` (jika terautentikasi produksi) atau `mockSession.user.name` (mode simulator).
- **Ringkasan Pesanan (Order Summary)**:
  - **Total Pesanan**: Jumlah baris data order.
  - **Pesanan Aktif**: Jumlah order dengan status `'PENDING'`, `'PROCESSING'`, atau `'SHIPPED'`.
  - **Sudah Selesai**: Jumlah order berstatus `'COMPLETED'`.
  - **Belum Bayar**: Jumlah order dengan paymentStatus `'unpaid'` atau `'cod_pending'`.
- **Ringkasan Request Paket (Package Request Summary)**:
  - **Total Request**: Jumlah pengajuan paket.
  - **Menunggu Review**: Request paket berstatus `'new'`.
  - **Sedang Ditinjau**: Request paket berstatus `'reviewing'`.
  - **Penawaran Final**: Request paket berstatus `'quoted'`.
- **Pesanan Terakhir (Latest Activity)**:
  - Menampilkan 1 baris item order terbaru (`latestOrder`) hasil pengurutan descending tanggal pemesanan (`createdAt`).
  - Merender visual ringkasan: ID order (`orderNumber`), nama menu utama (menggunakan helper `extractMenuName` untuk menggabungkan nama item ganda seperti `[Name] +X item`), status order, status pembayaran, total harga pesanan, tanggal order dibuat, serta label penunjuk sumber asal order (`sourceType`: `'package_request'` vs `'catalog'`).
  - **Empty State**: Jika tidak ada aktivitas pesanan, menampilkan visual box kosong `"Belum ada aktivitas pesanan terbaru"` dengan tautan CTA `"Mulai Pesan Sekarang"`.
- **Navigation Shortcuts**: Grid berisi tombol pintas visual ke halaman `/dashboard/orders`, `/dashboard/package-requests`, `/dashboard/profile`, dan `/dashboard/addresses`.
- **Footer Mode Simulator**: Banner static menerangkan status database local SQLite serta batasan status fitur yang masih ditahan (*HOLD - Fase E Production Readiness*).

### 3. Data Source & Data Flow
- **Client-Side Data Retrieval**: Data summary di-load secara dinamis di sisi client (`onMount()`) dengan memanggil data secara paralel via `Promise.all`:
  - `fetch('/api/orders')`
  - `fetch('/api/package-requests')`
- **User Parameterization**: Parameter pencarian `?userId=${authStore.user.id}` dilewatkan dalam fetch query string untuk mengunci target record sesuai kepemilikan akun.
- **Reactivity**: Penghitungan statistik dikomputasikan secara instan menggunakan rune `$derived` Svelte 5 (`orderStats` dan `requestStats`).
- **SSR Page Load**: Tidak ada pemanggilan API di tingkat server-side SvelteKit load function (`+page.ts` tidak ada atau kosong). Seluruh pengambilan data murni dijalankan pasca-render client side.

### 4. Auth & Access Control
- **Auth Guard**:
  - layout `+layout.svelte` mengecek keberadaan sesi melalui `authStore.isAuthenticated`.
  - Apabila tidak terautentikasi dan tidak berada dalam simulator persona, pengguna dialihkan ke `/login?error=auth_required` via `goto` di `onMount` dan `$effect` blok.
  - API endpoint `/api/orders` dan `/api/package-requests` dilindungi fungsi `requireAuth(cookies)` di sisi server-side.
- **Role Isolation**:
  - Layout `$effect` membatasi rute anak. Pengguna dengan peran `CUSTOMER` yang mencoba memuat halaman `/dashboard/admin` atau `/dashboard/cs` akan dipaksa redirect kembali ke `/dashboard?error=access_denied`.
  - CS yang mencoba mengakses `/dashboard/admin` diarahkan ke `/dashboard/cs?error=access_denied`.
- **User Data Visibility Safety**: Backend API (`/api/orders` & `/api/package-requests`) secara ketat menolak permintaan dengan HTTP 403 Forbidden apabila query `userId` dari request `CUSTOMER` tidak sama dengan ID user terautentikasi di cookie session token.

### 5. Technical Backend & Database Relations
- **API Mappings**:
  - GET `/api/orders` $\longrightarrow$ `orderService.getOrders(filters)` $\longrightarrow$ `orderRepository.listOrderRecords()` $\longrightarrow$ kueri data dari tabel `orders` dan `order_items` di SQLite.
  - GET `/api/package-requests` $\longrightarrow$ `packageRequestService.getPackageRequests(filters)` $\longrightarrow$ `packageRequestRepository.listPackageRequestRecords()` $\longrightarrow$ kueri dari tabel `package_requests` di SQLite.
- **Role / Session Validation**: Memanfaatkan helper `getCurrentUser` di `apps/src/lib/server/utils/authGuard.ts` yang membaca `cookies.get('session_token')` dan memvalidasi keaktifan token di database SQLite.

### 6. Integration with F08/F10/F11
- **F08 Integration**: Dashboard home mengagregasi data request paket catering, menghitung status new/reviewing/quoted secara dinamis, dan menavigasi ke halaman tracking `/dashboard/package-requests`.
- **F10 Integration**: Halaman dashboard mengarahkan customer ke riwayat pesanan `/dashboard/orders` dan memuat status detail pesanan aktif.
- **F11 Integration**: Status pembayaran pada detail "Pesanan Terakhir" terhubung secara visual dengan alur konfirmasi manual status pembayaran (Unpaid, Waiting Verification, Paid, Rejected).

### 7. Known Gaps
1. **Client-Side Loading Delay (No SSR / Visual Layout Shifting)**: Ketiadaan load function server-side menyebabkan layout dashboard sempat kosong atau memicu visual shifting saat client-side fetch (`Promise.all`) sedang memproses request data.
2. **Weak Initial Access Guard (Client-Side Guards)**: Karena redirect auth hanya dideklarasikan di tingkat client-side (`+layout.svelte` via `onMount` dan `$effect`), markup HTML dashboard awal tetap berpotensi ter-render sekejap di browser sebelum skrip JS mengalihkan user ke halaman login (jika user tidak login).
3. **No Auto-Refresh / Real-Time Sync**: Halaman dashboard tidak melakukan polling otomatis atau memiliki WebSocket subscription untuk memantau pembaruan status order atau review penawaran paket dari admin. Data baru akan termuat bila user melakukan refresh halaman manual.
4. **Stale Simulation State**: Status simulation disclaimer di footer dapat membingungkan jika user tidak memahami perbedaan akun demo simulator dengan akun autentikasi produksi riil.

## Technical Relations & Flow Map

### 1. Client Data Loading Flow
$$\text{Dashboard (+page.svelte: onMount)} \longrightarrow \text{Promise.all(fetch API)} \longrightarrow \begin{cases} \text{GET /api/orders?userId=X} \\ \text{GET /api/package-requests?userId=X} \end{cases} \longrightarrow \text{Derived stats computation via Svelte 5 runes}$$

### 2. Client Access Redirect Flow
$$\text{User accesses /dashboard} \longrightarrow \text{layout.svelte checks authStore} \longrightarrow \begin{cases} \text{Is Authenticated} \longrightarrow \text{Check role permission} \longrightarrow \text{Render child} \\ \text{Not Authenticated} \longrightarrow \text{Check local storage persona} \longrightarrow \begin{cases} \text{Yes} \longrightarrow \text{Render (Simulated)} \\ \text{No} \longrightarrow \text{Redirect /login} \end{cases} \end{cases}$$

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
