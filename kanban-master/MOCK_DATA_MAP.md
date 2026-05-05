# Mock Data Map

Dokumentasi data simulasi yang menjadi "kontrak" awal antara Frontend dan desain Database masa depan.

## `menu.ts`
- **Purpose**: Menyediakan data katalog menu live untuk landing page.
- **Used by**: `src/routes/+page.svelte`, `MenuCard.svelte`.
- **Main entities**: `Menu` (id, name, price, category, stock, image).
- **Storage**: Static file.
- **Backend candidate tables**: `menus`, `categories`.
- **Current limitations**: Stok tidak berkurang secara permanen setelah checkout.

## `session.ts`
- **Purpose**: Definisi role dan data user simulasi untuk mekanisme login demo.
- **Used by**: `mockSession.svelte.ts`, `src/routes/login/+page.svelte`.
- **Main entities**: `MockRole`, `MockUser`.
- **Storage**: Used as initial state for `localStorage`.
- **Backend candidate tables**: `users`, `roles`.
- **Current limitations**: Tidak ada enkripsi password.

## `cs.ts`
- **Purpose**: Data operasional untuk dashboard Customer Service.
- **Used by**: `/dashboard/cs/*` pages.
- **Main entities**: `MockCsOrder`, `MockCsMenu`, `MockCsCustomer`.
- **Storage**: Static file.
- **Backend candidate tables**: `orders`, `order_items`, `customers`.
- **Current limitations**: Update status hanya tersimpan di local state (hilang saat refresh).

## `admin.ts`
- **Purpose**: Data finansial dan manajerial untuk dashboard Admin.
- **Used by**: `/dashboard/admin/*` pages.
- **Main entities**: `MockAdminMetric`, `MockAdminSalesReport`, `MockAdminUser`, `MockAdminSetting`.
- **Storage**: Static file.
- **Backend candidate tables**: `financial_reports`, `settings`, `audit_logs`.
- **Current limitations**: Angka report statis (tidak dinamis berdasarkan order harian).

## `user.ts`
- **Purpose**: Data profil dan riwayat pesanan personal untuk Customer.
- **Used by**: `/dashboard/*` (User routes).
- **Main entities**: `MockUserProfile`, `MockUserOrder`, `MockUserAddress`.
- **Storage**: Static file.
- **Backend candidate tables**: `customers`, `addresses`.
- **Current limitations**: User tidak bisa menambah data yang benar-benar tersimpan lintas device.

---
**Catatan**: Struktur interface pada file-file ini akan digunakan sebagai dasar pembuatan skema **Drizzle ORM** pada fase pengembangan backend.
