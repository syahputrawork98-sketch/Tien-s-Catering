# Current Status

## Project Snapshot
- Project Name: WK-Web-Existing
- Template Type: Existing Web Project Adoption Template
- Current Mode: Zero Point / Existing Adoption Initial State
- Repository Status: Template Initialized
- Primary Workspace: Anti-Gravity IDE
- Default Executor Model: Gemini 3.5 Flash High

## Current Phase
F00 — Existing Project Zero Point

## Last Checkpoint
F00 initialized as the zero point of the Existing adoption template.
- Model usage strategy updated: Gemini 3.5 Flash High is now the default executor model; Gemini 3.1 Pro is reserved for escalation, architecture, and high-risk reasoning.

## Active Feature Tracker

| Feature Batch | Feature Name | Type | Status | Reason / Notes | Next Step | Detail File |
| --- | --- | --- | --- | --- | --- | --- |
| F00 | Existing Project Zero Point | Template Foundation | Completed | Titik nol template Existing sudah ditetapkan | Lanjut ke Feature Discovery ketika template dipakai pada project existing nyata | features/F00_PROJECT_WORKFLOW_FOUNDATION.md |

## Next Recommended Step
- Saat template dipakai pada project existing nyata, mulai dari read-only scan.
- Setelah itu lakukan F00 Existing Project Setup pada project nyata.
- Lanjutkan ke Feature Discovery untuk menemukan F01, F02, F03, dan seterusnya.
- Jangan langsung menyentuh frontend/backend/database sebelum fitur ditemukan dan dicatat.

## Safety Rules
- Jangan menyimpan credential/secret di repository.
- Jangan men-generate kode ekstensif di luar scope instruksi.
- Eksekutor dilarang melakukan git commit dan git push.

## Area Documentation Structure Checkpoint
- Area documentation structure sudah distandarkan.
- Docs frontend/backend/database/development sekarang memakai pola overview + map + feature-specific detail.
- Next step adalah menggunakan struktur ini saat project nyata mulai dibangun/diaudit.
