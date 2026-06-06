# Format Batch Baru TC

Batch baru TC mengadopsi format terstruktur dengan kode `FXX`:

- `F00` = Workflow / setup / adoption
- `F01` = Existing application inventory
- `F02` = Public menu & ordering
- `F03` = Cart, checkout & order flow
- `F04` = Admin order management
- `F05` = Payment verification
- `F06` = Reporting, invoice & export
- `F07` = Role, permission & security
- `F08` = Production readiness
- `FXX-CP` = Documentation checkpoint

## Struktur Batch Wajib

Setiap batch wajib memiliki struktur berikut saat diusulkan:

- **Feature Batch:** [Kode FXX]
- **Title:** [Nama Batch]
- **Objective:** [Tujuan Utama]
- **Allowed Scope:** [Area yang boleh diubah]
- **Forbidden Scope:** [Area yang tidak boleh disentuh]
- **Risk Level:** [Low / Medium / High]
- **Need Room 01 Review:** [Yes / No]
- **Execution Steps:** [Langkah pengerjaan yang mendetail]
- **Validation:** [Cara memvalidasi hasil eksekusi]
- **Expected Output:** [Ekspektasi akhir setelah batch selesai]
- **Executor Report:** [Laporan hasil eksekusi oleh AI]
