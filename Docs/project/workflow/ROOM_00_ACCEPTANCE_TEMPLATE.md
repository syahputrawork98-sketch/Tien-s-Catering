# Roomchat 00 Acceptance Template — WK

Fungsi:
Template ini dipakai Roomchat 00 setelah menerima laporan dari Gemini Anti-Gravity atau eksekutor.

Format wajib:

Roomchat 00 Acceptance

Feature Batch:
Execution Batch:
Commit Hash / Local State:
Acceptance Result:
* Accepted
* Accepted with Notes
* Needs Fix
* Needs Roomchat 01 Review
* Blocked
* HOLD
* Rejected

Reason:
[Alasan singkat kenapa hasil diterima / perlu perbaikan / perlu review]

Scope Check:
* File yang berubah sesuai instruksi:
* Ada perubahan di luar scope:
* Ada kode/config/dependency baru:
* Ada credential/security risk:

Validation Check:
* Validasi yang sudah dilakukan:
* Validasi yang belum dilakukan:

Need Roomchat 01 Review:
Yes / No

Need User Confirmation Before Next Batch:
Yes / No

Documentation Debt:
* Ada / Tidak ada
* Catatan:

Next Step:
[Langkah berikutnya]

Recommended Next Batch:
[Batch berikutnya jika aman]

Notes:
[Catatan tambahan]

Aturan:
* Jangan memberi Accepted jika status Gemini Partial/Blocked tanpa alasan kuat.
* Jangan lanjut batch berikutnya jika ada blocker.
* Jika ada perubahan sensitif, gunakan Needs Roomchat 01 Review atau minta konfirmasi user.
* Roomchat 00 boleh langsung menyiapkan batch berikutnya hanya jika hasil Accepted/Accepted with Notes, next step jelas, dan tidak menyentuh area sensitif.
