# TC Scope Guard

## Prinsip Scope

Project TC / Tien’s Catering saat ini dalam fase **Production Readiness**.
Artinya, fitur bisnis dikembangkan dan dimatangkan secara fungsional menggunakan **Development Persona Switcher** sebagai jembatan menuju sistem produksi penuh.

## Aturan Utama

1. **Project Ready Produksi**: Akses utama saat ini menggunakan **Development Persona Switcher** untuk memilih akun/persona. Jangan menghapus atau mengganti persona switcher menjadi auth production final tanpa instruksi khusus dari Room 00.
2. **Jangan membuka fitur besar** tanpa instruksi dari Room 00.
3. **Jangan membuat loop eksekusi** (Gemini 3 Flash hanya eksekusi satu kali per batch).
4. **Jangan memperluas scope** ke sistem produksi besar lain kecuali diminta Room 00, seperti:
   - Payment gateway real.
   - Deployment production final.
   - Legal/tax/e-Faktur.
   - Cloud storage.

## Kategori Fitur

1.  **Done / Selesai**: Fitur yang sudah diimplementasikan, diuji dalam batch, dan masuk ke status Accepted.
2.  **Ready for Batch**: Fitur yang sudah jelas definisinya dan siap dimasukkan ke dalam antrian pengerjaan batch berikutnya.
3.  **Production-Ready Features**: Fitur bisnis yang diimplementasikan dengan logika produksi namun masih menggunakan infrastruktur terkontrol (seperti SQLite lokal). Contoh:
    *   Payment proof upload (local storage foundation).
    *   Admin payment verification (manual logic).
    *   Commercial Invoice (basic print/PDF).
    *   Reporting & Export.
    *   Super Admin Control.
4.  **Hold Production / Final**: Fitur yang ditahan karena memerlukan integrasi pihak ketiga, sistem keamanan tingkat tinggi, atau legalitas resmi. Contoh:
    *   Login/Register/JWT/Session/Password (Production Final).
    *   RBAC Final (Server-side locking).
    *   Payment Gateway API (QRIS Real/Midtrans/dll).
    *   e-Faktur / Pajak Resmi.
    *   Deployment Production Hardening.

## Larangan Keras

Jangan membuat sistem berikut selama fase Production Readiness ini:
- Login/Register production dengan password database.
- JWT atau Session management production.
- Integrasi API Payment Gateway pihak ketiga.
- Sistem e-Faktur resmi.
- Deployment production final.

## Prinsip Utama

Gunakan **Development Persona Switcher** sebagai cara resmi untuk mengakses berbagai role selama pengembangan. Fokus pada pematangan flow bisnis agar benar-benar siap saat sistem keamanan final dibuka.
`Docs/project-control/` menjadi satu-satunya pusat kontrol resmi.