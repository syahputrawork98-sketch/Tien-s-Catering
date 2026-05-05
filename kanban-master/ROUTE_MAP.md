# Route Map

Peta rute aplikasi Tien's Catering beserta status implementasi saat ini.

| Route | Area | Role | Status | Data Source | Storage | Backend Required | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Public | ALL | Done | `mockMenus` | none | Yes | Landing page & Menu Catalog |
| `/login` | Public | ALL | Done | none | none | Yes | Quick login for testing roles |
| `/register` | Public | ALL | Done | none | none | Yes | UI-only registration |
| `/checkout` | Public | ALL | Done | `cart` store | none | Yes | Cart to Order flow |
| `/order-success` | Public | ALL | Done | none | `sessionStorage` | No | Success confirmation |
| `/dashboard` | Dashboard | USER | Done | `mockUserProfile` | `localStorage` | Yes | Home user, info poin/status |
| `/dashboard/orders` | Dashboard | USER | Done | `mockUserOrders` | none | Yes | Riwayat pesanan personal |
| `/dashboard/addresses` | Dashboard | USER | Done | `mockUserAddresses`| none | Yes | Kelola lokasi pengiriman |
| `/dashboard/profile` | Dashboard | USER | Done | `mockUserProfile` | none | Yes | Update data diri |
| `/dashboard/cs` | Dashboard | CS | Done | `mockCsOrders` | `localStorage` | Yes | Monitoring operasional harian |
| `/dashboard/cs/orders` | Dashboard | CS | Done | `mockCsOrders` | none | Yes | Validasi & update status order |
| `/dashboard/cs/menu` | Dashboard | CS | Done | `mockCsMenus` | none | Yes | Update stok menu harian |
| `/dashboard/cs/customers`| Dashboard | CS | Done | `mockCsCustomers`| none | Yes | Database pelanggan |
| `/dashboard/admin` | Dashboard | ADMIN | Done | `mockAdminMetrics`| `localStorage` | Yes | Overview bisnis & performa |
| `/dashboard/admin/reports`| Dashboard | ADMIN | Done | `mockAdminSales` | none | Yes | Laporan keuangan mingguan |
| `/dashboard/admin/users` | Dashboard | ADMIN | Done | `mockAdminUsers` | none | Yes | Manajemen akun & role |
| `/dashboard/admin/settings`| Dashboard | ADMIN | Done | `mockAdminSettings`| none | Yes | Konfigurasi sistem |

## Legend
- **Status Done**: UI fungsional dengan mock data.
- **Backend Required**: Membutuhkan database real di masa depan.
- **Storage**: Media penyimpanan state sementara di sisi client.
