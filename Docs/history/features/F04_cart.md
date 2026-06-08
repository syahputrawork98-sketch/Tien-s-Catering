# F04 — Cart

## Feature Type
Customer / Public

## Discovery Source
- **Frontend Page**: [apps/src/routes/checkout/](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/routes/checkout/)
- **Components**: [apps/src/lib/components/CartDrawer.svelte](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/components/CartDrawer.svelte), [apps/src/lib/components/MenuCard.svelte](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/components/MenuCard.svelte), [apps/src/lib/components/ModalMenuDetail.svelte](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/components/ModalMenuDetail.svelte), [apps/src/lib/components/PublicNavbar.svelte](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/components/PublicNavbar.svelte)
- **State Store**: [apps/src/lib/stores/cartStore.svelte.ts](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/stores/cartStore.svelte.ts)
- **API Endpoint**: [apps/src/routes/api/orders/](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/routes/api/orders/)
- **Service & Repository**: [apps/src/lib/server/services/orderService.ts](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/server/services/orderService.ts), [apps/src/lib/server/repositories/orderRepository.ts](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/server/repositories/orderRepository.ts)

## Current Status
Found / Needs Functional Validation

## What Exists
1. **Cart Store Structure (`cartStore.svelte.ts`)**:
   - Class `CartStore` mengekspos state reaktif `items` (array `CartItem`) dan boolean `isDrawerOpen`.
   - Objek `CartItem` menyimpan `id`, `name`, `price`, `image`, `category`, `quantity`, `deliveryDate`, dan `availableStock` opsional.
   - Menyimpan snapshot detail menu lengkap (nama, harga, gambar, kategori), bukan hanya ID menu.
2. **Persistence**:
   - Keranjang disimpan di `localStorage` browser menggunakan key `'cart'`.
   - Dimuat secara otomatis saat inisialisasi aplikasi (di konstruktor store) dan diserialisasi kembali dengan validasi sanitasi tipe data via `normalizeSavedCart`.
   - Disimpan secara otomatis menggunakan reaktivitas `$effect` Svelte setiap kali isi keranjang belanja diubah.
3. **Cart Actions**:
   - `addItem(menu, date)`: Menambahkan item menu baru untuk tanggal tertentu atau menaikkan jumlah porsi jika item untuk tanggal yang sama sudah ada, disertai validasi batas sisa stok harian.
   - `removeItem(id, date)`: Menghapus item dari keranjang berdasarkan ID dan tanggal pengiriman.
   - `updateQuantity(id, date, delta)`: Menyesuaikan kuantitas item (+1 atau -1), menghapus item jika kuantitas mencapai 0, dan memblokir penambahan jika melebihi batas stok.
   - `clear()`: Mengosongkan seluruh isi keranjang.
4. **UI & Checkout Integration**:
   - `PublicNavbar.svelte` merender cart badge secara reaktif menggunakan properti `cart.totalItems`.
   - `CartDrawer.svelte` menampilkan daftar item keranjang dengan visual feedback batas stok, tombol kuantitas, dan link ke halaman `/checkout`.
   - `checkout/+page.svelte` menguraikan item keranjang menjadi payload `items` berisi `menuId`, `name`, `quantity`, dan `price`, lalu mengirimkannya via POST ke `/api/orders`.
   - Jika order sukses dikirim, `cart.clear()` dipanggil; jika gagal, data keranjang tetap dipertahankan.

## Technical Relations & Flow Map

### 1. Read / Write Persistence Flow
$$\text{cartStore.svelte.ts constructor} \longleftarrow \text{JSON.parse(localStorage.getItem('cart'))} \longleftarrow \text{Sanitize via normalizeSavedCart}$$
$$\text{State change (items)} \longrightarrow \text{\$effect} \longrightarrow \text{localStorage.setItem('cart', JSON.stringify(items))}$$

### 2. UI Actions & State Updates
$$\text{MenuCard.svelte / ModalMenuDetail.svelte / CartDrawer.svelte} \longrightarrow \text{cartStore.svelte.ts actions} \longrightarrow \text{Update items state} \longrightarrow \text{Trigger reactive UI re-renders (badge/warnings)}$$

### 3. Checkout Integration
$$\text{checkout/+page.svelte (cart.items)} \longrightarrow \text{Payload mapping} \longrightarrow \text{POST /api/orders} \longrightarrow \text{If 201: cart.clear()}$$

## UI Behaviors Discovered
- **Badge Counter**: Badge merah di atas ikon navigasi menampilkan jumlah total porsi (`cart.totalItems`) secara real-time.
- **Stock Safeguard**: Tombol tambah (`+`) di laci keranjang dinonaktifkan jika batas stok tercapai (`canIncrease` = false).
- **Warning Hints**: Laci keranjang belanja merender pesan `"Maksimal X porsi tersedia"` secara dinamis jika jumlah pesanan menyentuh batas stok.

## Known Gaps (Needs Audit / Validation)
- **Stale availableStock**: Ketersediaan stok (`availableStock`) disimpan statis dalam item keranjang belanja di `localStorage`. Jika ada transaksi lain yang mengurangi stok di database, data lokal ini tidak ter-refresh secara otomatis kecuali pengguna memuat ulang katalog menu.
- **No Expiry Clean-up**: Item keranjang belanja yang dipesan untuk tanggal pengiriman yang sudah lampau tetap menetap di `localStorage` dan tidak dibersihkan secara otomatis.
- **Validation Bypass**: Halaman `/checkout` memperingatkan pengguna jika ada data keranjang lama yang tidak memiliki informasi stok (`unknownStockCount`), tetapi **tetap memperbolehkan checkout** tanpa melakukan verifikasi ulang ketersediaan stok aktual ke server-side database.
- **Backend API Validation Gap**: Endpoint `/api/orders` POST tidak memvalidasi ulang sisa stok harian aktual di database SQLite saat order dibuat (order sukses dengan status `new`). Penolakan karena stok habis ditunda hingga Admin mencoba mengonfirmasi pesanan tersebut menjadi `confirmed`.

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
