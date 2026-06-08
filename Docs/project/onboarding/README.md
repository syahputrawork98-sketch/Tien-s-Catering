# Panduan Onboarding Prompt TC

Dokumen ini menjelaskan cara menggunakan prompt onboarding untuk memandu asisten AI (ChatGPT dan Gemini) dalam proses pengembangan **Tien's Catering (TC)**.

## Sistem Pembagian Ruang (Room System)
Sistem pengerjaan TC dibagi menjadi beberapa peran ruang chat (Room) untuk menjaga keamanan dan keteraturan:

1. **ChatGPT.com / Manager Room**: Ruang utama Product Owner untuk mengatur arah proyek secara umum, membuat keputusan bisnis, dan merancang tugas sebelum dieksekusi.
2. **Roomchat 00 (Main Controller / Coordinator)**: Ruang eksekusi instruksi teknis. Bertanggung jawab menganalisis status terkini, memvalidasi ruang lingkup berkas, dan menyiapkan rencana kerja rinci.
3. **Roomchat 01 (Reviewer / Quality Gate)**: Ruang penilai kualitas. Bertugas mengaudit hasil pekerjaan Gemini atau Roomchat 00 untuk memastikan tidak ada perubahan tidak sah di area terkunci (HOLD).
4. **Roomchat Specialist (Topic Specialist)**: Ruang analisis khusus (seperti UI/UX, database, security) jika ada masalah spesifik yang membutuhkan pemikiran mendalam.

## Prinsip Penting
- **Sistem F-number Aktif**: Pelacakan proyek menggunakan kode fitur F00 hingga F34, **bukan** sistem Batch lama. Catatan batch lama hanya berfungsi sebagai bukti sejarah mentah.
- **Mode Aktif**: Proyek saat ini berjalan dalam mode `Feature Discovery / Existing Project Audit`.
- **Status F02–F34**: Seluruh fitur utama berstatus `Discovered / Needs Audit`. Jangan menganggap fitur tersebut selesai sebelum dilakukan validasi fungsi nyata.
- **Discovery-First**: Pekerjaan teknis hanya boleh diajukan setelah status fitur dan pemetaan kodenya terdokumentasi dengan jelas.

## Daftar Prompt Onboarding
Gunakan file prompt berikut untuk di-copy-paste ke asisten AI masing-masing:
- [CHATGPT_MANAGER_PROMPT.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/project/onboarding/CHATGPT_MANAGER_PROMPT.md)
- [ROOMCHAT_00_PROMPT.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/project/onboarding/ROOMCHAT_00_PROMPT.md)
- [ROOMCHAT_01_REVIEWER_PROMPT.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/project/onboarding/ROOMCHAT_01_REVIEWER_PROMPT.md)
- [ROOM_SPECIALIST_PROMPT.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/project/onboarding/ROOM_SPECIALIST_PROMPT.md)
- [GEMINI_EXECUTOR_PROMPT.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/project/onboarding/GEMINI_EXECUTOR_PROMPT.md)
- [ROOM_FLOW.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/project/onboarding/ROOM_FLOW.md)
