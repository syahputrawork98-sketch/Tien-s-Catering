# Docs Tien's Catering

Folder `Docs/` adalah dokumentasi arah produk berdasarkan keputusan **Room Chat 00**.  
Dokumen di sini dipakai sebagai acuan product direction, scope, dan alur kerja lintas room.

## Daftar Dokumen

1. `00-project-overview.md`
2. `01-product-direction.md`
3. `02-current-repo-state.md`
4. `03-role-and-scope.md`
5. `04-order-and-payment-flow.md`
6. `05-documentation-index.md`
7. `06-commit-and-push-rules.md`
8. `07-backend-foundation-plan.md`
9. `08-order-api-and-admin-flow.md`
10. `09-package-catering-request-flow.md`
11. `10-production-readiness-gap.md`
12. `ROADMAP_BATCH_31_45.md` (Roadmap Fase A-D - Legacy)
13. `ROADMAP_PHASE_E_BATCH_48_60.md` (Roadmap Fase E - Active)
14. `project-control/` (Pusat Kontrol Resmi)

## Prinsip Workflow

`Room 01 Analisa -> Room 00 Keputusan -> Gemini 3 Flash Eksekusi -> Room 00 Evaluasi`

## Lokasi Dokumentasi Aktif
- `Docs/project-control/`: Pusat kontrol resmi, workflow, dan status project.
- `Docs/`: Detail teknis, roadmap, dan keputusan arsitektur.
- `FITUR.md`: Status fitur dan backlog aktif.
- `README.md`: Struktur folder dan status high-level.

## Status Terakhir (Mei 2026)

- **Batch 60 Selesai**: Docs Sync + Handoff Room Baru.
  - **Status**: *Production Candidate (Controlled Mode)*.
  - **Technical**: Auth Foundation & API Role Guards (Batch 55), Data Isolation (Batch 56), Session Hardening (Batch 57), Manual Payment Settings (Batch 59) selesai.
- **Fase A–E (Batch 31–60)**: Seluruh rangkaian transisi keamanan utama telah selesai (**Accepted**).
  - **Status**: *Ready for Commercial Features*.
  - **Persona**: *Development Persona Switcher* tetap aktif sebagai orchestrator role resmi.
- **Prinsip Scope**: Sistem siap untuk fitur operasional komersial (Invoice/Faktur) dengan batasan "Manual Payment" dan "Local SQLite".
