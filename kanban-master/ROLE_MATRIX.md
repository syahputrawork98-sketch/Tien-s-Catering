# Role Matrix

Daftar hak akses dan fitur utama berdasarkan role pengguna.

## Table 1 — Role Access Matrix

| Role | Allowed Routes | Main Features | Current Data Mode | Backend Required |
| :--- | :--- | :--- | :--- | :--- |
| **PUBLIC** | `/`, `/katalog`, `/paket-catering`, `/tentang-kami`, `/kontak`, `/login`, `/register`, `/checkout`, `/order-success` | Browse menu, Cart, Checkout | `menu.ts`, `cartStore` | Auth & Order DB |
| **USER** (Customer) | `/dashboard/*` | View orders, Profile, Manage Address | `user.ts` | Customer Profile DB |
| **CS** | `/dashboard/cs/*` | Manage orders, Update menu stock, View customers | `cs.ts` | Order Operations DB |
| **ADMIN** | `/dashboard/admin/*` | View reports, User management, System settings | `admin.ts` | Financial & User DB |

## Table 2 — Feature by Role

| Feature | PUBLIC | USER | CS | ADMIN | Notes |
| :--- | :---: | :---: | :---: | :---: | :--- |
| View Catalog | ✅ | ✅ | ✅ | ✅ | Publik akses |
| Add to Cart | ✅ | ✅ | ❌ | ❌ | Hanya untuk pemesan |
| Checkout Simulation | ✅ | ✅ | ❌ | ❌ | Alur pemesanan |
| View Personal Orders | ❌ | ✅ | ❌ | ❌ | Private per user |
| Manage Own Address | ❌ | ✅ | ❌ | ❌ | Lokasi pengiriman |
| Confirm Orders | ❌ | ❌ | ✅ | ✅ | CS & Admin operasional |
| Update Menu Availability| ❌ | ❌ | ✅ | ✅ | Stok harian |
| View Sales Reports | ❌ | ❌ | ❌ | ✅ | Strategis/Manajerial |
| Manage User Accounts | ❌ | ❌ | ❌ | ✅ | Admin hanya |
| System Configuration | ❌ | ❌ | ❌ | ✅ | Setting global |
| Role Switcher (Dev) | ✅ | ✅ | ✅ | ✅ | Untuk mempermudah testing |

## Role Summary
- **PUBLIC**: Fokus pada konversi (Landing to Order).
- **USER**: Fokus pada retensi & self-service (Tracking & Profile).
- **CS**: Fokus pada operasional (Processing & Stock).
- **ADMIN**: Fokus pada analisis & kontrol (Reports & User Management).
