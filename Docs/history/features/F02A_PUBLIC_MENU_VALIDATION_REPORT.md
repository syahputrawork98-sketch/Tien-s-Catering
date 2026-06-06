# F02A — Public Menu & Ordering Functional Validation Plan

## Objective
Memvalidasi alur *public menu & ordering* melalui code-review struktural. Jika secara logika terbukti lengkap, komponen ini dapat diajukan untuk *manual functional testing* (atau otomatis) sebelum resmi dinaikkan statusnya menjadi **Functionally Validated**.

## Validation Result (Source Code Audit)

Berdasarkan inspeksi read-only pada *codebase*, berikut adalah temuan validasi untuk F02:

### 1. Identifikasi Route Public Menu
- **Katalog Menu:** Route `apps/src/routes/katalog/+page.svelte` sudah terhubung dengan server-side loading logic di `+page.ts`.
- Terdapat *fallback* ke `mockMenus` jika server/database gagal, memastikan aplikasi tidak crash jika *backend* bermasalah.

### 2. Identifikasi Sumber Data Menu
- **Endpoint API:** Request ke `/api/menus` tersambung dengan mulus ke `getReadOnlyMenus()` di dalam *service layer*.
- **Database:** `apps/src/lib/server/repositories/menuRepository.ts` mengeksekusi query ke SQLite (`better-sqlite3`), mengambil `menu_daily_stock` (stok harian per tanggal) dan relasi ke tabel utama `menus`.

### 3. Identifikasi Alur Tambah Item / Cart
- **Komponen Modal:** `ModalMenuDetail.svelte` menangani penambahan *item*.
- **Stock Guarding:** Validasi stok dilakukan dengan baik di komponen modal. Modal mencegah user menambah jumlah pesanan (*quantity*) melebihi `remainingStock` atau batas limit harian.
- **Cart Store:** Penyimpanan dikelola di `apps/src/lib/stores/cartStore.svelte.ts` dengan penyimpanan lokal (*localStorage*) di sisi klien, menyimpan ID produk, jumlah, dan tanggal pengiriman.

### 4. Checkout & Order Submit
- **Checkout Route:** `apps/src/routes/checkout/+page.svelte` memiliki antarmuka formulir yang lengkap: Nama, WhatsApp, Tanggal Pengiriman, Bidang/Bagian, Lantai, Catatan Lokasi, Metode Pembayaran (Cash/Transfer/QRIS/COD dalam mode simulasi), dan Catatan Tambahan.
- **Pre-Submit Validation:** Terdapat fungsi `getStockIssues()` untuk memeriksa ulang persediaan stok per item di keranjang sebelum disubmit, mencegah pembeli "menyelundupkan" barang yang sudah habis stoknya sejak mereka mulai memilih.
- **Submit API:** Payload yang rapi dikirimkan secara POST ke `/api/orders`.
- **Order Handler:** `apps/src/routes/api/orders/+server.ts` menerima order dan menyalurkannya ke `createOrder`. Alur checkout publik/anonim dizinkan selama tidak ada `userId` yang diklaim secara ilegal. Jika sukses, klien akan di-*redirect* ke rute `/order-success`.

## Bugs / Blockers / Notes
- **Tidak ada Blocker struktural.** Logika bisnis untuk menampilkan menu, menahan *over-ordering* melalui *stock constraint*, dan membuahkan order ke database via API sudah terangkai.
- **Payment Simulasi:** Pembayaran masih menggunakan opsi *mock* (Simulasi QRIS/Transfer). Fungsionalitas konfirmasi pembayaran sungguhan memang berada di luar cakupan F02 dan masuk ke F05.
- **Accessibility (A11y):** Terdapat peringatan (warning) aksesibilitas *Svelte* pada `ModalMenuDetail.svelte` yang juga sempat dicatat di `CURRENT_STATUS.md`.

## Conclusion
Alur Public Menu & Ordering **terbukti beroperasi secara logika dan struktur kode (Structurally Complete & Wired)**. 
**Status saat ini:** Siap dinaikkan menjadi **Functionally Validated** apabila *Room 00* telah memvalidasinya secara manual melalui UI browser. Kami (Executor) belum mengubah statusnya sebelum tes manual/interaktif diizinkan atau dilakukan oleh user.
