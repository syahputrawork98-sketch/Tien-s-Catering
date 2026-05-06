# Tien's Catering Kanban Master

Folder ini adalah pusat dokumentasi, checklist, dan tracking kondisi project Tien's Catering versi baru. Semua informasi di sini disusun berdasarkan kondisi aktual aplikasi frontend saat ini.

## Current Source of Truth

Sumber kondisi saat ini adalah aplikasi frontend yang berlokasi di:
`../apps/`

## Current Project Mode

Project saat ini berada dalam mode:
**`Frontend UI-Only Prototype`**

Artinya:
- Semua halaman utama (Public, User, CS, Admin) sudah berbentuk UI fungsional.
- Navigasi antar role sudah diimplementasikan menggunakan mock session.
- Backend belum dibuat (tidak ada koneksi database atau API).
- Auth masih bersifat simulasi di sisi client.
- Data menggunakan kombinasi Mock Data, `localStorage`, dan `sessionStorage`.

## Important Decision

Backend lama dari repositori `catering-fullstack` **tidak dimigrasikan** karena kompleksitas dan kebutuhan desain ulang. Backend baru akan dirancang secara "Rebirth" setelah fase UI-only ini selesai dan didokumentasikan di sini.

## Documents

- [**CURRENT_STATE.md**](./CURRENT_STATE.md): Ringkasan kondisi aktual project (Frontend, Auth, Data, Backend).
- [**KANBAN_FRONTEND.md**](./KANBAN_FRONTEND.md): Board tracking fitur frontend per module (UI-DONE, TODO, IN PROGRESS).
- [**FRONTEND_ATOMIC_CHECKLIST.md**](./FRONTEND_ATOMIC_CHECKLIST.md): Checklist detail setiap halaman, komponen, dan fitur yang sudah ada.
- [**ROUTE_MAP.md**](./ROUTE_MAP.md): Peta seluruh route aplikasi beserta status dan dependensinya.
- [**ROLE_MATRIX.md**](./ROLE_MATRIX.md): Matriks hak akses dan fitur berdasarkan Role (Public, User, CS, Admin).
- [**MOCK_DATA_MAP.md**](./MOCK_DATA_MAP.md): Dokumentasi struktur data simulasi yang digunakan saat ini.
- [**COMPONENT_INVENTORY.md**](./COMPONENT_INVENTORY.md): Daftar seluruh komponen Svelte yang tersedia dan status penggunaannya.
- [**UI_ISSUES_AND_POLISH.md**](./UI_ISSUES_AND_POLISH.md): Daftar perbaikan UI, a11y, dan UX yang masih tertunda.
- [**BACKEND_NOT_STARTED.md**](./BACKEND_NOT_STARTED.md): Pernyataan tegas mengenai status backend dan rencana pengembangan masa depan.
