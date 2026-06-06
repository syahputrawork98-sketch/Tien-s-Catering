# Current Application Status — TC Tien’s Catering

## Last Updated
2026-06-07

## Overall Status
TC adalah existing project dengan aplikasi yang sudah berjalan, bukan project kosong. File ini mencatat status terkini dari masing-masing area fungsional aplikasi berdasarkan bukti dari repositori.

F01A (Existing TC Application Inventory) baru saja dieksekusi. Inventory ini berbasis struktur repo, bukan hasil functional testing. Hasil detail dapat dilihat di `Docs/history/features/F01_EXISTING_TC_APPLICATION_INVENTORY.md`.

## Structurally Present / Not Functionally Validated
F02-F08 memiliki indikasi struktur/folder terkait di repo, tetapi belum divalidasi secara fungsional.
- F02 — Public menu & ordering
- F03 — Cart, checkout & order flow
- F04 — Admin order management
- F06 — Reporting, invoice & export

## Not Found / Not Checked
- F08 — Production readiness

## Known Issues
Not confirmed yet

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
- Setelah F01B selesai dan diterima, lanjut ke persiapan F02.
- Jangan aktifkan F02-F08 menjadi *active tracker* sebelum F01 inventory direview dan accepted sepenuhnya.
