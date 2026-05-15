# TC Scope Guard

## Prinsip Scope

Project TC / Tien’s Catering dikembangkan dengan prinsip **Pre-Auth Local Development** yang kini menuju **Production Readiness**.
Artinya, fitur bisnis dikembangkan secara fungsional menggunakan **Development Persona Switcher** sebelum masuk ke fase pengamanan (Authentication/Security) final.

## Aturan Utama

1. **Project Ready Produksi**: Tetap memakai **Development Persona Switcher**. Jangan menghapus atau mengganti persona switcher menjadi auth production final tanpa instruksi khusus.
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
3.  **Local-Compatible / Bisa Dikerjakan**: Fitur bisnis yang dapat diimplementasikan fungsionalitasnya tanpa memerlukan sistem produksi (Auth/Payment Gateway riil). Contoh:
    *   Payment proof upload (local storage).
    *   Admin payment verification (manual logic).
    *   Commercial Invoice (basic print/PDF).
    *   Reporting & Export (data SQLite).
    *   Super Admin Simulation.
4.  **Hold Production / Final**: Fitur yang ditahan karena memerlukan integrasi pihak ketiga, sistem keamanan tingkat tinggi, atau legalitas resmi. Contoh:
    *   Login/Register/JWT/Session/Password.
    *   RBAC Final (Server-side locking).
    *   Payment Gateway API (QRIS Real/Midtrans/dll).
    *   e-Faktur / Pajak Resmi.
    *   Deployment Production Hardening.

## Larangan Keras

Jangan membuat sistem berikut selama fase pre-auth:
- Login/Register production dengan password database.
- JWT atau Session management production.
- Integrasi API Payment Gateway pihak ketiga.
- Sistem e-Faktur resmi.
- Deployment production final.

## Prinsip Utama

Lebih baik jujur bahwa fitur sedang "Hold" atau "Simulasi Lokal" daripada membuat fitur palsu yang terlihat production-ready tetapi rapuh di sisi keamanan.
`Docs/project-control/` menjadi satu-satunya pusat kontrol resmi.