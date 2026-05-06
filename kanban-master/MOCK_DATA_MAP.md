# Mock Data Architecture Map
_Updated: 2026-05-06 — Single Source of Truth Refactor_

## Arsitektur Baru

```
apps/src/lib/mock/
├── catalog.ts          ← SUMBER UTAMA: Menu & Paket
├── accounts.ts         ← SUMBER UTAMA: Semua akun (user, CS, admin)
├── orders.ts           ← SUMBER UTAMA: Semua pesanan
├── reports.ts          ← DERIVED: Laporan admin (dihitung dari orders & accounts)
│
├── menu.ts             ← ADAPTER: mockMenus untuk public katalog
├── packages.ts         ← ADAPTER: mockPackages untuk public paket-catering
├── cs.ts               ← ADAPTER: mockCsOrders, mockCsMenus, mockCsCustomers
├── admin.ts            ← ADAPTER: mockAdminUsers, re-export metrics/reports
├── orders_dashboard.ts ← ADAPTER: dashboardOrders untuk user dashboard
├── session.ts          ← ADAPTER: mockUsers untuk mock login/session
└── user.ts             ← Profile & address data (belum direfactor)
```

---

## Sumber Data Per File

### `catalog.ts` — Menu & Paket
**Single Source of Truth untuk semua item katalog.**

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | string | Unique identifier |
| `type` | `'menu' \| 'package'` | Jenis item |
| `name` | string | Nama item |
| `slug` | string | URL-friendly name |
| `description` | string | Deskripsi item |
| `category` | string | Kategori utama |
| `basePrice` | number | Harga dasar |
| `image` | string? | URL gambar |
| `isActive` | boolean | Status aktif |
| `isAvailable` | boolean | Ketersediaan |
| `status` | CatalogItemStatus | active/inactive/sold_out/draft |
| `tags` | string[]? | Tag opsional |
| `features` | string[]? | Fitur/benefit |
| `suitableFor` | string[]? | Cocok untuk event apa |
| `createdAt` | string | Tanggal dibuat |
| `updatedAt` | string | Tanggal diperbarui |
| `activeDate` | string? | **Khusus menu**: tanggal aktif |
| `stockLabel` | string? | **Khusus menu**: label stok |
| `dailyStock` | number? | **Khusus menu**: stok harian |
| `packageCategory` | string? | **Khusus paket**: kategori paket |
| `minPax` | number? | **Khusus paket**: minimal pax |
| `packageItems` | string[]? | **Khusus paket**: isi paket |

**Dipakai oleh:**
- `menu.ts` (adapter → public katalog)
- `packages.ts` (adapter → public paket-catering)
- `cs.ts` (adapter → CS Menu halaman)
- `cs.ts` (adapter → CS Packages halaman)

---

### `accounts.ts` — Semua Akun
**Single Source of Truth untuk user, customer, CS, dan admin.**

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Nama lengkap |
| `email` | string? | Email |
| `whatsapp` | string? | Nomor WhatsApp |
| `address` | string? | Alamat utama |
| `role` | MockAccountRole | USER / CUSTOMER_SERVICE / ADMIN |
| `accountType` | MockAccountType? | Tipe akun final (CS/Admin yang tentukan) |
| `requestedType` | MockAccountType? | Tipe yang diminta user saat register |
| `status` | MockAccountStatus | pending/approved/rejected/active/inactive |
| `registrationStatus` | string? | Status registrasi |
| `createdBy` | string? | Siapa yang buat akun |
| `approvedBy` | string? | Siapa yang approve |
| `registeredAt` | string? | Tanggal registrasi |
| `approvedAt` | string? | Tanggal approved |
| `rejectedReason` | string? | Alasan penolakan |
| `internalNote` | string? | Catatan internal CS |
| `totalOrders` | number? | Total pesanan |
| `lastOrderDate` | string? | Pesanan terakhir |
| `lastLogin` | string? | Login terakhir |

**Dipakai oleh:**
- `session.ts` (adapter → demo login)
- `cs.ts` (adapter → CS Customers halaman)
- `admin.ts` (adapter → Admin Users halaman)
- `reports.ts` (derived → hitung customer aktif)

---

### `orders.ts` — Semua Pesanan
**Single Source of Truth untuk semua order.**

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | string | Unique identifier |
| `orderNumber` | string | Nomor order (TC-YYYY-NNN) |
| `customerId` | string | Referensi ke accounts.ts |
| `customerName` | string | Nama customer (denormalized) |
| `whatsapp` | string | Kontak customer |
| `orderDate` | string | Tanggal pesan |
| `deliveryDate` | string | Tanggal antar |
| `address` | string | Alamat pengiriman |
| `status` | MockOrderStatus | new/confirmed/processing/ready/delivered/completed/cancelled |
| `paymentStatus` | MockPaymentStatus | unpaid/waiting_verification/paid/refunded |
| `total` | number | Total biaya |
| `items` | MockOrderItem[] | Item pesanan |
| `notes` | string? | Catatan |
| `cancelledBy` | string? | Siapa yang cancel |
| `cancellationReason` | string? | Alasan cancel |
| `completedConfirmedByUser` | boolean? | Konfirmasi selesai dari user |
| `completedConfirmedByCs` | boolean? | Konfirmasi selesai dari CS |
| `completedConfirmedByAdmin` | boolean? | Konfirmasi selesai dari admin |
| `completionNote` | string? | Catatan penyelesaian |

**Dipakai oleh:**
- `cs.ts` (adapter → CS Orders halaman)
- `orders_dashboard.ts` (adapter → User Dashboard Orders)
- `reports.ts` (derived → hitung revenue, total order, pending)

---

### `reports.ts` — Derived Reports
**Data laporan admin yang dihitung dari orders & accounts.**

Fungsi helper:
- `getTotalRevenue()` — Total revenue dari completed orders
- `getTotalOrderCount()` — Total semua order
- `getPendingOrderCount()` — Order dengan status 'new'
- `getActiveCustomerCount()` — Customer approved dengan totalOrders > 0

Export:
- `mockAdminMetrics` — 4 metric kartu dashboard admin
- `mockAdminSalesReports` — Laporan mingguan (derived dari grouped orders)
- Fallback ke data statis jika tidak ada completed orders yang cukup

---

## Adapter Files

| File | Mengambil dari | Menyediakan untuk |
|---|---|---|
| `menu.ts` | `catalog.ts` | Public `/katalog` |
| `packages.ts` | `catalog.ts` | Public `/paket-catering` |
| `cs.ts` | `catalog.ts`, `accounts.ts`, `orders.ts` | Semua halaman CS dashboard |
| `admin.ts` | `accounts.ts`, `reports.ts` | Semua halaman Admin dashboard |
| `orders_dashboard.ts` | `orders.ts` | User `/dashboard/orders` |
| `session.ts` | `accounts.ts` | Mock login/session |

---

## Mapping ke Backend (Future)

Saat backend dibuat, mapping ke tabel database:

| Mock File | Backend Table |
|---|---|
| `catalog.ts` | `catalog_items`, `categories` |
| `accounts.ts` | `users`, `roles`, `customers` |
| `orders.ts` | `orders`, `order_items` |
| `orders.ts` (payment fields) | `payments` |
| `reports.ts` | Views / aggregates / `reports` |
| `user.ts` (addresses) | `addresses` |
| `admin.ts` (settings) | `settings` |

---

## Status Refactor

| Komponen | Status |
|---|---|
| `catalog.ts` → public katalog | ✅ Done (via `menu.ts` adapter) |
| `catalog.ts` → public paket | ✅ Done (via `packages.ts` adapter) |
| `catalog.ts` → CS Menu | ✅ Done (via `cs.ts` adapter) |
| `catalog.ts` → CS Packages | ✅ Done (via `cs.ts` adapter) |
| `accounts.ts` → CS Customers | ✅ Done |
| `accounts.ts` → Admin Users | ✅ Done |
| `accounts.ts` → Session/Login | ✅ Done |
| `orders.ts` → CS Orders | ✅ Done |
| `orders.ts` → User Dashboard | ✅ Done |
| `orders.ts` → Admin Reports | ✅ Done (via `reports.ts`) |
| `user.ts` profile/address | ⏳ Belum direfactor (low priority) |
