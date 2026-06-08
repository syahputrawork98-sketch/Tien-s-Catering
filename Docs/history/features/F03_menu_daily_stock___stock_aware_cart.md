# F03 — Menu Daily Stock / Stock-Aware Cart

## Feature Type
Foundation / Frontend

## Discovery Source
- **Frontend Page**: [apps/src/routes/katalog/](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/routes/katalog/), [apps/src/routes/checkout/](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/routes/checkout/)
- **Components**: [apps/src/lib/components/MenuCard.svelte](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/components/MenuCard.svelte), [apps/src/lib/components/ModalMenuDetail.svelte](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/components/ModalMenuDetail.svelte)
- **State Store**: [apps/src/lib/stores/cartStore.svelte.ts](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/stores/cartStore.svelte.ts)
- **API Endpoint**: [apps/src/routes/api/menus/+server.ts](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/routes/api/menus/+server.ts), [apps/src/routes/api/orders/](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/routes/api/orders/)
- **Service & Repository**: [apps/src/lib/server/services/orderService.ts](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/server/services/orderService.ts), [apps/src/lib/server/repositories/orderRepository.ts](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/server/repositories/orderRepository.ts)
- **Database Tables**: `menu_daily_stock` and `orders` (stock-aware fields) in [apps/src/lib/server/db/schema.ts](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/server/db/schema.ts)

## Current Status
Found / Needs Functional Validation

## What Exists
1. **Database Schema**:
   - Tabel `menu_daily_stock` menampung kendala stok per menu per tanggal (`menu_id`, `active_date`, `daily_stock`, `remaining_stock`, `stock_label`, `status`).
   - Tabel `orders` melacak status deduksi stok (`stock_status`, `stock_deducted_at`, `stock_released_at`).
2. **Frontend & Local Store Validation**:
   - `cartStore.svelte.ts` menyimpan `deliveryDate` untuk setiap item di keranjang dan membatasi penambahan quantity berdasarkan sisa stok harian (`availableStock`).
   - `MenuCard.svelte` menonaktifkan tombol tambah ke keranjang jika stok habis atau batas kuantitas di keranjang telah menyentuh batas stok harian.
   - `ModalMenuDetail.svelte` menghitung secara dinamis sisa stok yang bisa ditambahkan (`maxSelectableQuantity = Math.max(0, itemStock - currentCartQty)`) dan membatasi quantity selector modal.
   - `checkout/+page.svelte` memeriksa `stockIssues` secara reaktif dan menonaktifkan submit `"Konfirmasi & Pesan Sekarang"` jika ada item keranjang belanja melebihi sisa stok hariannya.
3. **Backend Stock Logic**:
   - Pengurangan stok tidak terjadi ketika checkout (API POST `/api/orders`).
   - Pengurangan/potong stok harian (`remaining_stock`) terjadi di database transaction SQLite di `orderRepository.ts` saat Admin mengonfirmasi status pesanan (`confirmed`).
   - Pemulihan stok (restore) ke `menu_daily_stock` terjadi jika Admin membatalkan pesanan (`cancelled`) yang stoknya sebelumnya sudah didebit (`deducted`).

## Technical Relations & Flow Map

### 1. Daily Stock Data Flow (Read)
$$\text{SQLite DB (menus JOIN menu\_daily\_stock)} \longrightarrow \text{menuRepository.ts (getMenuStockRecords)} \longrightarrow \text{menuService.ts} \longrightarrow \text{GET /api/menus} \longrightarrow \text{katalog/+page.ts} \longrightarrow \text{MenuCard.svelte / ModalMenuDetail.svelte} \longrightarrow \text{cartStore.svelte.ts}$$

### 2. Client Stock-Aware Cart Validation Flow
$$\text{cartStore.svelte.ts (localStorage)} \longleftrightarrow \text{checkout/+page.svelte (Re-check stock vs items.quantity)} \longrightarrow \text{Validation Check (Pass/Fail)} \longrightarrow \text{Disable / Enable Checkout Button}$$

### 3. Database Stock Deduction Flow (Write)
$$\text{Admin Order Update} \longrightarrow \text{orderService.ts (updateOrderStatus)} \longrightarrow \text{orderRepository.ts (updateOrderStatusRecord inside SQLite transaction)} \longrightarrow \text{Deduct / Restore remaining\_stock}$$

## UI Behaviors Discovered
- **Visual Alert**: Rendahnya stok (`stock < 5`) menampilkan visual `Sisa: X porsi` berwarna oranye berkedip (`animate-pulse`).
- **Overlay Habis**: `stock === 0` menampilkan badge `"Habis Terjual"` dan mendisable tombol tambah.
- **Cart Warning**: Jika user mencoba melebihi stok di katalog, tampil teks `"Maksimal X porsi sudah ada di keranjang"`.
- **Checkout Warning Panel**: Jika keranjang di checkout memiliki isu stok (misal karena stok baru terupdate atau cart stale), checkout di-disable dan menampilkan pesan error merah/oranye mendetail.

## Known Gaps (Needs Audit / Validation)
- **Timezone Mismatch**: Tanggal katalog digenerasi dengan `toISOString().split('T')[0]` di UTC, berpotensi tidak sinkron dengan waktu GMT+7 server/dapur saat pergantian hari (jam 00:00 - 06:59 WIB).
- **Concurrency & Race Condition Checkout**: Checkout diperbolehkan meskipun melebihi sisa stok harian karena server-side tidak memeriksa atau memotong stok pada saat order dibuat (status `new`). Potong stok hanya terjadi saat Admin mengonfirmasi status menjadi `confirmed`. Jika banyak pelanggan meng-order produk terbatas, mereka semua akan berhasil checkout, dan Admin baru mendapati error `insufficient_stock` saat mencoba mengonfirmasi order-order tersebut satu per satu.
- **Stale Cart Data**: Item keranjang yang tersimpan lama di `localStorage` bisa memuat `availableStock` yang kedaluwarsa atau tidak memiliki info stok (`unknownStockCount`), yang saat ini diizinkan untuk dicheckout pada mode demo.

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
