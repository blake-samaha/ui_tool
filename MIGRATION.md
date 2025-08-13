# Migration: modules/* to projects/*/modules/*

This project moved generated artifacts from:
- `project_templates/modules/<module>/...`

to a project-scoped layout:
- `project_templates/projects/<project>/modules/<module>/...`

Manual migration steps:
- Decide each module’s owning project ID (folder-friendly name)
- For each module folder under `project_templates/modules/`:
  - Create `project_templates/projects/<project>/modules/` if missing
  - Move the entire module folder under that path

Notes:
- UI-state JSON and YAML path shapes are otherwise unchanged beyond the new prefix
- The UI will read/write only the new project-scoped layout going forward
