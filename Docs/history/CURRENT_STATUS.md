# Current Application Status — TC Tien’s Catering

## Last Updated
2026-06-07

## Overall Status
TC adalah existing project dengan riwayat panjang (Batch 1-70). Semua fitur yang telah diselesaikan di masa lalu (tercatat di `FITUR.md` dan `README.md`) berstatus **Completed Local/Manual**. 
Dalam sistem kerja baru (Tracker F02-F08), fitur-fitur tersebut harus melewati tahap **Functionally Validated**. Saat ini, inventory F01 baru mengonfirmasi bahwa komponen-komponen tersebut **Structurally Present** di dalam repositori.

F01C (TC History Source-of-Truth Sync Audit) baru saja menyinkronkan status ini untuk menghilangkan kontradiksi.

## Completed Local/Manual (Pre-F00)
Merujuk pada `FITUR.md`, berbagai modul (Katalog, Checkout, Admin Orders, Report, Local Auth) telah selesai di Batch 1-70 dan berstatus fungsional di tahap development lokal sebelumnya.

## Structurally Present / Not Functionally Validated (New Tracker)
F02-F08 memiliki indikasi struktur/folder terkait di repo sesuai F01A, tetapi belum divalidasi secara fungsional dalam alur kerja baru.
- F02 — Public menu & ordering
- F03 — Cart, checkout & order flow
- F04 — Admin order management
- F06 — Reporting, invoice & export

## Not Found / Not Checked
- F08 — Production readiness (Belum ada konfigurasi deployment/Docker)

## Known Issues
- `src/lib/components/ModalMenuDetail.svelte` memiliki warning aksesibilitas (A11y) sesuai catatan `FITUR.md`.

## Risk / HOLD Areas
Area berikut adalah area sensitif yang tidak boleh dibuka atau diubah tanpa approval user dan Room 01 review:
- F05 — Payment verification (Not Fully Confirmed / Payment HOLD)
- F07 — Role, permission & security (Structurally Present / HOLD Production)
- auth
- role/permission
- database
- payment
- deployment
- security
- production readiness
- domain/SSL
- cloud storage
- legal/tax/e-Faktur

## Next Priority
- Lanjut persiapan F02 setelah F01 (A, B, C) direview dan accepted.
- Jangan aktifkan F02-F08 menjadi *active tracker* sebelum acceptance eksplisit.
