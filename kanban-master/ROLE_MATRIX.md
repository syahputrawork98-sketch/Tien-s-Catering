# Role Matrix

Daftar hak akses dan fitur utama berdasarkan role pengguna.

## Table 1 — Role Access Matrix

| Role | Allowed Routes | Main Features | Current Data Mode | Backend Required |
| :--- | :--- | :--- | :--- | :--- |
| **PUBLIC** | `/`, `/katalog`, `/paket-catering`, `/tentang-kami`, `/kontak`, `/login`, `/register`, `/checkout`, `/order-success` | Browse menu, Cart, Checkout | `menu.ts`, `cartStore` | Auth & Order DB |
| **USER** (Customer) | `/dashboard/*` | View orders, Profile, Manage Address, Choose Payment Method, Upload Proof | `user.ts`, `orders.ts` | Customer Profile DB |
| **CS** | `/dashboard/cs/*` | Manage orders, Update menu stock, View customers, Validate Payment, Confirm COD | `cs.ts`, `orders.ts` | Order Operations DB |
| **ADMIN** | `/dashboard/admin/*` | View reports, User management, System settings, Validate Payment, Confirm COD | `admin.ts`, `orders.ts` | Financial & User DB |

## Table 2 — Feature by Role

| Feature | PUBLIC | USER | CS | ADMIN | Notes |
| :--- | :---: | :---: | :---: | :---: | :--- |
| View Catalog | ✅ | ✅ | ✅ | ✅ | Publik akses |
| Add to Cart | ✅ | ✅ | ❌ | ❌ | Hanya untuk pemesan |
| Checkout Simulation | ✅ | ✅ | ❌ | ❌ | Alur pemesanan |
| View Personal Orders | ❌ | ✅ | ❌ | ❌ | Private per user |
| Manage Own Address | ❌ | ✅ | ❌ | ❌ | Lokasi pengiriman |
| Choose Payment Method | ❌ | ✅ | ❌ | ❌ | Full/DP/COD [TODO] |
| Upload Payment Proof | ❌ | ✅ | ❌ | ❌ | Simulasi UI [TODO] |
| Confirm Orders | ❌ | ❌ | ✅ | ✅ | CS & Admin operasional |
| Validate Payment | ❌ | ❌ | ✅ | ✅ | Cek bukti transfer [TODO] |
| Confirm COD Received | ❌ | ❌ | ✅ | ✅ | Serah terima uang [TODO] |
| Update Menu Availability| ❌ | ❌ | ✅ | ✅ | Stok harian |
| View Sales Reports | ❌ | ❌ | ❌ | ✅ | Strategis/Manajerial |
| Manage User Accounts | ❌ | ❌ | ❌ | ✅ | Admin hanya |
| System Configuration | ❌ | ❌ | ❌ | ✅ | Setting global |
| Role Switcher (Dev) | ✅ | ✅ | ✅ | ✅ | Untuk mempermudah testing |
| Real Auth Permission | ❌ | ❌ | ❌ | ❌ | [BLOCKED-BACKEND] |
| Real Role Guard | ❌ | ❌ | ❌ | ❌ | [BLOCKED-BACKEND] |

## Role Summary
- **PUBLIC**: Fokus pada konversi (Landing to Order).
- **USER**: Fokus pada retensi & self-service (Tracking & Profile).
- **CS**: Fokus pada operasional (Processing & Stock).
- **ADMIN**: Fokus pada analisis & kontrol (Reports & User Management).
