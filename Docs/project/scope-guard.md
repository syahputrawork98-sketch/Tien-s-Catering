# TC Scope Guard

## Prinsip Scope

Project TC / Tien’s Catering dikembangkan dengan prinsip **Pre-Auth Local Development**.
Artinya, fitur bisnis utama tetap dikembangkan secara fungsional menggunakan **Developer Persona Switcher** dan **SQLite Lokal** sebelum masuk ke fase pengamanan (Authentication/Security).

### Kategori Fitur

Untuk menjaga fokus dan mencegah *scope creep*, fitur dikategorikan sebagai berikut:

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
5.  **Future / Nanti**: Fitur tambahan yang direncanakan setelah core flow bisnis stabil.

## Aturan Pengerjaan

1.  **Developer Persona Switcher** tetap menjadi standar navigasi antar role selama fase pre-auth.
2.  Jangan membuka fitur **Hold Production** tanpa keputusan eksplisit dari Room 00.
3.  Fitur **Local-Compatible** boleh diusulkan masuk ke roadmap/batch jika flow dasar sudah stabil.
4.  Gunakan placeholder, disabled action, atau empty state yang jujur untuk fitur yang masih Hold.

## Larangan Keras

Jangan membuat sistem berikut selama fase pre-auth:
- Login/Register production dengan password database.
- JWT atau Session management production.
- Integrasi API Payment Gateway pihak ketiga.
- Sistem e-Faktur resmi.
- Deployment production final.

## Prinsip Utama

Lebih baik jujur bahwa fitur sedang "Hold" atau "Simulasi Lokal" daripada membuat fitur palsu yang terlihat production-ready tetapi rapuh di sisi keamanan.