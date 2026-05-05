# Component Inventory

Daftar seluruh komponen Svelte yang tersedia di `apps/src/lib/components/`.

| Component | Path | Used In | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `PublicNavbar` | `src/lib/components/PublicNavbar.svelte` | Root Layout, Landing Page | **Active** | Global navigation header |
| `CartDrawer` | `src/lib/components/CartDrawer.svelte` | Root Layout | **Active** | Shopping cart UI & Logic |
| `MenuCard` | `src/lib/components/MenuCard.svelte` | Katalog Page | **Active** | Ditambah tombol Lihat Detail |
| `ModalMenuDetail` | `src/lib/components/ModalMenuDetail.svelte` | Katalog Page | **Active** | Detail menu & Quantity selector |
| `PackageDetailModal`| `src/lib/components/PackageDetailModal.svelte`| Paket Catering | **Active** | Detail paket & Layanan premium |
| `OrderStatusBadge` | `src/lib/components/OrderStatusBadge.svelte`| CS/User Dashboard | **Active** | Status colors (New, Processing, etc) |
| `StatusStepper` | `src/lib/components/StatusStepper.svelte` | Order Detail (Mock) | **Active** | Visual progress pesanan |
| `ThemeToggle` | `src/lib/components/ThemeToggle.svelte` | Navbar / Sidebar | **Active** | Dark/Light mode switcher |
| `ClientHub` | `src/lib/components/operations/ClientHub.svelte`| - | **Legacy Candidate**| Dari repo lama, belum dipakai |
| `MenuHub` | `src/lib/components/operations/MenuHub.svelte` | - | **Legacy Candidate**| Dari repo lama, belum dipakai |
| `OrderHub` | `src/lib/components/operations/OrderHub.svelte` | - | **Legacy Candidate**| Dari repo lama, belum dipakai |
| `StockHub` | `src/lib/components/operations/StockHub.svelte` | - | **Legacy Candidate**| Dari repo lama, belum dipakai |

## Summary
- **Active Components**: 8 fungsional di arsitektur baru.
- **Legacy Candidates**: 4 komponen kompleks dari repo lama yang kemungkinan akan di-rewrite atau dipecah karena terlalu terikat backend lama.
- **Needs Review**: Komponen yang memerlukan penyesuaian logika ke Svelte 5 Runes.

**Instruksi**: Hindari penggunaan komponen `Legacy Candidate` untuk fitur baru tanpa melakukan refactor total ke Svelte 5.
