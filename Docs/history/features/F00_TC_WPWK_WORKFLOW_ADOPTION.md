# F00 — TC WPWK Workflow Adoption

## Status
In Progress

## Area
docs/project + docs/history

## Purpose
Migrasi workflow dan cara kerja TC agar mengikuti WPWK-style control layer. Tujuannya adalah membuat pemisahan yang jelas antara aturan (project), status terkini (history), dan dokumen usang (archive). F00 khusus untuk foundation workflow ini dan bukan fitur aplikasi.

## Current Understanding
Batch ini hanya melakukan dokumentasi dan tidak menyentuh kode aplikasi. Aplikasi sudah berjalan (existing) dan tetap dipertahankan strukturnya tanpa perubahan arsitektur. F00A telah membuat control dan history layer awal. F00B sedang berjalan untuk memperbaiki arsip, panduan onboarding, dan menstabilkan feature tracker. Batch berikutnya, F01, akan fokus pada inventory aplikasi.

## HOLD / Risk Notes
- Tidak ada risiko teknis terkait aplikasi.
- Risiko administratif: memastikan dokumen lama terarsip rapi.
- Aplikasi sama sekali tidak disentuh dalam F00.

## Next Step
F00B — Correction & Stabilization

## Validation Needed
- Pastikan folder `Docs/project/` dan `Docs/history/` terbentuk dengan instruksi yang lengkap.
- Pastikan seluruh *legacy documents* dari root maupun folder lama telah diarsipkan dengan aman.
