# Routing Map

| Route / Page | Type | Access | Related Feature | Source Path | Notes |
| --- | --- | --- | --- | --- | --- |
| `/katalog` | Public Page | Guest / Customer | **F02** | `apps/src/routes/katalog/` | Halaman katalog menu harian |
| `/checkout` | Customer Page | Guest / Customer | **F03**, **F05** | `apps/src/routes/checkout/` | Halaman finalisasi pemesanan & validasi sisa stok |
| `/order-success` | Customer Page | Guest / Customer | **F05**, **F06** | `apps/src/routes/order-success/` | Halaman konfirmasi sukses pemesanan |
| `/paket-catering` | Public Page | Guest / Customer | **F07** | `apps/src/routes/paket-catering/` | Halaman daftar katalog paket catering publik |
| `/dashboard` | Customer Page | Customer | **F09** | `apps/src/routes/dashboard/+page.svelte` | Halaman utama dashboard customer |
| `/dashboard/package-requests` | Customer Page | Customer | **F08** | `apps/src/routes/dashboard/package-requests/` | Halaman tracking status request paket pelanggan |
| `/dashboard/admin/package-requests` | Admin Page | Admin / CS | **F08** | `apps/src/routes/dashboard/admin/package-requests/` | Halaman review dan konversi request paket oleh admin |

