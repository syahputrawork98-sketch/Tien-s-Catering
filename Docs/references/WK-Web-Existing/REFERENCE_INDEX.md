# WK-Web-Existing Documentation Reference Index

## Overview
This directory contains a complete copy of the documentation files from the **WK-Web-Existing** repository. These files serve as an internal reference for workflow management, developer onboarding, and project status tracking mechanisms.

- **Source Workspace**: `WK-Web-Existing`
- **Location in TC**: [Docs/references/WK-Web-Existing/](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/references/WK-Web-Existing/)

## Purpose & Scope
1. **Workflow Reference Only**: The purpose of this folder is to make the WK workflow methodology (such as batch sizes, definitions of done, and discovery-first rules) directly readable inside the `TC-Tien-s-Catering` workspace. This allows AI assistants and human developers to refer to these guidelines without switching workspaces.
2. **Strictly Non-Executable**: These documents are **reference-only**.
3. **No UI or Code Templates**: TC does **not** adopt the UI templates or codebase structure of WK-Web-Existing. WK documents must **never** be treated as or converted into application code for TC.
4. **Independent Identity**: TC keeps its own dedicated application structure (in SvelteKit), its own Tailwind CSS design patterns, its own local SQLite databases, and its own feature logs.
5. **No Overwriting**: These reference files are stored separately from native TC documentation. They do not overwrite or replace any TC-native docs.

## Folder Directory Map

Here is the structure of the copied documentation from `WK-Web-Existing`:

- [README.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/references/WK-Web-Existing/README.md) - Main documentation entry point.
- **`project/`**:
  - [project/README.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/references/WK-Web-Existing/project/README.md) - Project metadata overview.
  - **`project/workflow/`**:
    - [project/workflow/EXISTING_MODE.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/references/WK-Web-Existing/project/workflow/EXISTING_MODE.md) - Detailed guide on how existing mode works.
    - [project/workflow/WORKING_SYSTEM.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/references/WK-Web-Existing/project/workflow/WORKING_SYSTEM.md) - Core workflow mechanics (batches, roles, safety).
    - [project/workflow/WORKFLOW_SCENARIOS.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/references/WK-Web-Existing/project/workflow/WORKFLOW_SCENARIOS.md) - Playbook of workflow scenarios.
    - [project/workflow/MODEL_USAGE_GUIDE.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/references/WK-Web-Existing/project/workflow/MODEL_USAGE_GUIDE.md) - Recommendations for model selection.
    - Templates: [BATCH_GATE_TEMPLATE.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/references/WK-Web-Existing/project/workflow/BATCH_GATE_TEMPLATE.md), [EXECUTOR_REPORT_TEMPLATE.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/references/WK-Web-Existing/project/workflow/EXECUTOR_REPORT_TEMPLATE.md), [REVIEW_CHECKLIST_TEMPLATE.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/references/WK-Web-Existing/project/workflow/REVIEW_CHECKLIST_TEMPLATE.md), [ROOM_00_ACCEPTANCE_TEMPLATE.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/references/WK-Web-Existing/project/workflow/ROOM_00_ACCEPTANCE_TEMPLATE.md), [SPECIALIST_ANALYSIS_TEMPLATE.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/references/WK-Web-Existing/project/workflow/SPECIALIST_ANALYSIS_TEMPLATE.md).
- **`history/`**:
  - [history/CURRENT_STATUS.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/references/WK-Web-Existing/history/CURRENT_STATUS.md) - Last audited state dashboard.
  - [history/FEATURE_HISTORY.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/references/WK-Web-Existing/history/FEATURE_HISTORY.md) - Feature index.
  - **`history/features/`**:
    - [F00_PROJECT_WORKFLOW_FOUNDATION.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/references/WK-Web-Existing/history/features/F00_PROJECT_WORKFLOW_FOUNDATION.md)
    - [F01_AREA_DOCUMENTATION_STRUCTURE.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/references/WK-Web-Existing/history/features/F01_AREA_DOCUMENTATION_STRUCTURE.md)
- **`frontend/`**: Mapping UI files to features.
- **`backend/`**: Mapping API/logic routes to features.
- **`database/`**: Mapping DB schemas to features.
- **`development/`**: Command instructions and local setup guides.
- **`deployment/`**: Release/environment setup guides.

## Usage Guideline
Future AI assistants working inside the `TC-Tien-s-Catering` workspace can query and read files inside this directory to align their task execution flow, report structures, and validation procedures with the official `WK-Web-Existing` specifications.
