# Sistem Kerja Resmi TC (Tien's Catering)

Proyek TC mengikuti alur kerja (working system) berikut:

User / CEO
↓
Room 00 — Project Lead & Decision Maker
↓
Room 01 — Reviewer / Auditor jika batch berisiko
↓
Gemini 3.1 Pro — Executor
↓
User Review
↓
Commit & Push oleh User
↓
GitHub menjadi Source of Truth

## Aturan Sistem Kerja
- **Room 00** menentukan arah dan scope pekerjaan.
- **Room 01** dipakai untuk melakukan review terhadap risiko.
- **Gemini** murni bertindak sebagai executor dan tidak mengambil keputusan strategis.
- **User** tetap menjadi pengambil keputusan akhir.
- **GitHub** menjadi kondisi resmi (Source of Truth) setelah dilakukan commit/push.

## Practical Workflow

1. User gives direction.
2. Room 00 checks current status and feature history.
3. Room 00 prepares safe FXX batch.
4. Room 01 reviews only if risk requires it.
5. Gemini executes only the approved batch scope.
6. Gemini returns Executor Report.
7. Room 00 reviews Executor Report.
8. User decides whether to commit/push.
9. GitHub becomes Source of Truth after commit/push.

## If Scope Leakage Happens

If Executor Report shows files outside Allowed Scope changed:
- do not commit
- mark batch as Needs Fix or Blocked
- ask Gemini to revert or correct only the leaked changes
