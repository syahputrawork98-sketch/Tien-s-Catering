# F06 — Order Success

## Feature Type
Customer

## Discovery Source
- **Frontend Page**: [apps/src/routes/order-success/](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/routes/order-success/)
- **Checkout Page**: [apps/src/routes/checkout/](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/routes/checkout/)
- **API Endpoint**: [apps/src/routes/api/orders/[id]/](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/routes/api/orders/[id]/)
- **Database Tables**: `orders` and `order_items` in [apps/src/lib/server/db/schema.ts](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/server/db/schema.ts)

## Current Status
Found / Needs Functional Validation

## What Exists
1. **Order Success Page (`order-success/+page.svelte`)**:
   - Rute halaman `/order-success` merupakan landing page pasca-pembelian yang ditujukan untuk mengonfirmasi bahwa pesanan pelanggan telah berhasil diterima oleh server dapur.
   - Merender indikator sukses visual berupa centang hijau dengan animasi scale.
   - Menampilkan receipt kartu transaksi berisi rincian ringkas: Nomor Pesanan, Nama Pemesan, Status Pesanan, Status Pembayaran, dan Total Pembayaran.
   - Menyediakan tombol CTA ("Pantau Di Dashboard Saya" menuju ke `/dashboard/orders` dan "Kembali Ke Beranda" ke `/`).
   - Menyertakan pemberitahuan statis bahwa pembaruan status order akan diinfokan lewat WhatsApp.
2. **Session Storage Data Loading**:
   - Membaca data order secara lokal dari browser `sessionStorage` menggunakan key `'lastOrder'` di dalam hook `onMount` (baris 19-33).
   - Memetakan field `orderNumber`, `customerName`, `status`, `paymentStatus`, dan `total` untuk dirender ke UI.
   - Jika key `'lastOrder'` kosong, ia merender state fallback: `"Data pesanan terakhir tidak ditemukan di sesi ini."`.
3. **Checkout Redirect Integration**:
   - Pengalihan dilakukan secara imperatif dari `checkout/+page.svelte` pasca menerima respons sukses HTTP 201 dari endpoint POST `/api/orders`.
   - Data order hasil respons disimpan ke `sessionStorage` sesaat sebelum pembersihan keranjang belanja lokal (`cart.clear()`) dan navigasi `goto('/order-success')` dijalankan.
   - Pengalihan **tidak membawa query parameter** order ID di URL.
4. **Order Detail API (`/api/orders/[id]`)**:
   - Terdapat rute API `/api/orders/[id]` GET yang memuat detail data pesanan dari database via `getOrder(id)`.
   - Endpoint terlindungi oleh otorisasi cookies session (`requireAuth`) dan memvalidasi kepemilikan data order jika diakses oleh user role `CUSTOMER`. Namun, **halaman `/order-success` tidak memicu pemanggilan API detail ini** sama sekali.

## Technical Relations & Flow Map

### 1. Checkout Success Redirect Flow
$$\text{checkout/+page.svelte} \longrightarrow \text{Save response order to sessionStorage ('lastOrder')} \longrightarrow \text{cart.clear()} \longrightarrow \text{goto('/order-success')}$$

### 2. Receipt Rendering Flow
$$\text{order-success/+page.svelte} \longleftarrow \text{sessionStorage.getItem('lastOrder')} \longrightarrow \text{Format & Render fields (total, orderNumber, status)}$$

## UI Behaviors Discovered
- **Volatile Receipt Card**: Ringkasan transaksi dirender secara dinamis dari memori session; ia akan memicu empty state jika data session hilang.
- **CTA Actions**: Tombol penjejakan mengarahkan pelanggan ke dashboard riwayat order mereka agar memantau status pembayaran lebih lanjut.

## Known Gaps (Needs Audit / Validation)
- **Data Volatility (Refresh Loss)**: Karena halaman bergantung penuh pada data `sessionStorage` dan redirect tidak membawa query parameters, me-refresh halaman pada tab/browser baru menyebabkan hilangnya rincian transaksi (empty fallback card).
- **Missing Items Details**: Kartu receipt di halaman sukses tidak menampilkan daftar per item menu yang dibeli beserta jumlah porsinya, mengurangi kejelasan rincian barang.
- **No WhatsApp CS Share Trigger**: Tidak ada tombol instan untuk mengirimkan bukti receipt sukses pemesanan tersebut ke WhatsApp admin/CS secara manual.
- **No Receipt Print/Download**: Halaman sukses tidak memiliki tombol cetak (*print*) atau ekspor tanda terima (*receipt*) dalam format PDF ramah-cetak.
- **Volatile plain-text Storage**: Data pesanan sensitif disimpan secara plain-text JSON di browser client-side `sessionStorage` yang berpotensi terekspos jika terjadi celah keamanan XSS.

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
