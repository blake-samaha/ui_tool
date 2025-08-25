## Wizard Requirements (New Single-Phase Behavior)

### Purpose

- Define the new single-phase wizard (Tier 00: Toolkit Scaffolding) that orchestrates `cdf` CLI commands to initialize a Toolkit repo, manage modules, and emit `config.[env].yaml`.
- Remove all other tiers from routing and user navigation while keeping code for future phases.

### Platform and prerequisites

- Target OS: macOS only (PoC/UAT).
- Toolkit presence is required. On app load, check `cdf --version` via file bridge. If missing, show a blocking overlay with guidance to install via uv.
  - If a `.venv` exists at the repository root: `source .venv/bin/activate && uv pip install cognite-toolkit`
  - Otherwise: `uv venv && source .venv/bin/activate && uv pip install cognite-toolkit`
  - Provide a "Re-check" button.

### Persistence model

- **Single source of truth (editing)**: UI-state JSON at `project_templates/ui-state/00_toolkit.json`.
- **Output artifacts**: Files written at repository root on Finish:
  - `cdf.toml` (via `cdf repo init`)
  - `config.[env].yaml` (one per environment)
- **Repo resume**: On repository selection, scan existing `cdf.toml`, `config.*.yaml`, and `modules/` to seed UI-state.

### File locations

- UI-state (single phase): `project_templates/ui-state/00_toolkit.json`
- Output files (Toolkit): `cdf.toml`, `config.[env].yaml`, and `modules/**`

### Initialization and resume

- User selects `repositoryRoot` (absolute path). If it does not exist, prompt to create it.
- Run `cdf repo init --host <GitHub|Azure DevOps|None|Other>` on proceed. This is idempotent.
- Read existing Toolkit files to pre-fill UI-state when present.

### Save and Finish semantics

- **Save**: Writes UI-state JSON only.
- **Finish**:
  - Executes pending `cdf` commands (e.g., `repo init` if needed; `modules add` for defined modules not yet present).
  - Creates requested module subdirectories (`data_models`, `transformations`, `spaces`, `auth`) with `.gitkeep` where applicable.
  - Validates minimal `config.[env].yaml` against a local `config_env.schema.json` before writing (checks: `environment.name`, `environment.project`, optional `environment.selected[]`, optional `variables` object). Invalid envs are reported and skipped; valid envs are written.
  - Writes `config.[env].yaml` to the repository root.

### Navigation, validation, and UX

- Linear steps with Next/Back; visible stepper with completion status.
- Dirty-check dialog on navigate away; manual Save action.
- Validation is step-scoped; warnings allow continue. Errors from commands do not block navigation but mark the step as failed and are surfaced in Review.
- A persistent indicator shows unresolved command failures; Finish is blocked only if required artifacts are missing.
- Project directory picker integrates with the file bridge.

### Steps (Tier 00: Toolkit Scaffolding)

- Repository & Host
  - Fields: `repositoryRoot` (picker), `host` dropdown (`GitHub`, `Azure DevOps`, `None`, `Other`).
  - Actions: Initialize via `cdf repo init --host <host>`.
- Environments
  - Default rows: `dev`, `prod`. Users can add any number; free-form `name`.
  - Fields per env: `name`, `cdf_project`, optional `type` (free text).
- Modules
  - Define one or more modules by name. No command executed immediately; queued for Finish.
  - For each module, capture optional description and tags (written to module.toml under `[packages] tags`).
  - On Finish, run `cdf modules add <name>` for each new module, then scaffold graph-model-relevant subdirectories with `.gitkeep`:
    - `spaces`, `containers`, `views`
    - `transformations`, `raw`, `functions`, `datasets`, `auth`
  - Reference: [Toolkit Modules - Customizing modules](https://docs.cognite.com/cdf/deploy/cdf_toolkit/guides/modules/custom) and [Toolkit Usage - Configure, build, and deploy modules](https://docs.cognite.com/cdf/deploy/cdf_toolkit/guides/usage).
- Environment Configuration
  - Select active modules per environment.
  - Variables editor supports nested structures (object/array where feasible; persisted as YAML under `variables`).
- Review & Generate
  - Summary and diff of pending changes (repo init status, modules to add, files to write).
  - Run generation and show stdout/stderr per step.

### Import and legacy

- Legacy 00/01/XX YAML import is not supported in the new flow.
- Resume behavior relies on scanning existing Toolkit files instead of importing legacy YAML.

### Error handling

- On `cdf` command failure, show a modal with stderr (with optional details accordion) and actions: Retry, Close.
- Do not block navigation on errors; mark the step as failed and surface a banner in Review until issues are resolved. Finish is blocked only if required outputs are missing.

### Secrets policy

- The UI never captures raw secrets. `.env` management is left to Toolkit and the user.

### Acceptance criteria

- `cdf repo init` executed (idempotent) with selected host.
- `config.[env].yaml` files generated and validated against `config_env.schema.json`.
- No `.env` files are written by the UI.
- Modules added via `cdf modules add <name>` and requested subdirectories created.
- UI-state saved at `project_templates/ui-state/00_toolkit.json`.