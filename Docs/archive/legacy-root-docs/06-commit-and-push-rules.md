# 06 - Commit and Push Rules

## Tujuan

Dokumen ini menetapkan aturan commit/push untuk menjaga workflow Room 01, Room 00, dan eksekusi Gemini 3 Flash tetap aman serta terkontrol.

## Format Commit Message

Gunakan format:

`type(scope): short description`

## Type yang Dipakai

- `feat`
- `fix`
- `docs`
- `style`
- `refactor`
- `chore`
- `test`
- `perf`

## Scope yang Dipakai

- `project`
- `docs`
- `workflow`
- `frontend`
- `backend`
- `data`
- `config`
- `deps`

## Contoh Commit Message

- `docs(project): add initial TC documentation`
- `docs(workflow): add commit and push rules`
- `feat(frontend): add daily menu stock display`
- `fix(frontend): prevent checkout with empty cart`
- `style(frontend): polish daily menu card layout`
- `refactor(data): reorganize mock order data`
- `chore(config): update lint configuration`

## Aturan Eksekusi Commit

- Gemini 3 Flash tidak boleh commit/push tanpa instruksi eksplisit dari Room 00.
- Sebelum commit, wajib cek `git status --short`.
- Commit hanya boleh memasukkan file sesuai scope task yang disetujui.
- Wajib hindari ikut memasukkan file di luar scope, termasuk perubahan tidak terkait.

## Aturan Eksekusi Push

- Push hanya boleh dilakukan setelah Room 00 menyetujui.
- `force push` dilarang, kecuali diminta secara eksplisit oleh Room 00.

## Checklist Singkat

1. Verifikasi scope kerja.
2. Jalankan `git status --short`.
3. Pastikan hanya file relevan yang di-`add`.
4. Gunakan format commit message yang benar.
5. Lakukan push hanya setelah approval Room 00.
