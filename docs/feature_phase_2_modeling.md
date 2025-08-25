## Feature: Phase 2 – Modeling Context Wizard

### Summary

- Add a post-Finish success notification to Phase 1 with a clear CTA to proceed to Phase 2.
- Introduce a new Phase 2 wizard focused on capturing the business context for graph modeling at the module level and emitting a human-friendly markdown document per module.

### Current behavior after Finish (Phase 1: Foundation)

- `WizardShell` calls `onFinish(cleaned)` and returns.
- `Tier00Page.onFinish` writes UI-state JSON, validates and writes `config.[env].yaml`, scaffolds modules, and writes `.env.example`. It then sets a YAML preview in-place.
- Implemented: A success modal confirms completion and offers a CTA to proceed to Phase 2 (or stay/close).

### Problem statement

- Users have no explicit confirmation that generation succeeded.
- There is no guided next step to continue the solution design (Phase 2).

### Goals and objectives

- Confirm success of Phase 1 output generation and provide a frictionless CTA to Phase 2.
- Capture modeling business context in a concise, non-technical artifact that downstream engineers can act on.
- Keep the output human-readable and reviewable (markdown), living inside the selected module’s repo area.

### Scope (Phase 2)

- Capture, per targeted module:
  - Purpose and scope (overview required; optional business outcomes, success criteria, constraints).
  - Personas (name required; optional role; optional pain points/problems-to-solve).
  - List of objects/entities relevant to the model (names and short descriptions only).
  - Cross-module and inter-model relationships (dependencies, references, and integration touchpoints).
  - Implements mapping for objects to CDF data model types (e.g., custom `oilWell` implements `CogniteEquipment`).
- Emit two artifacts per module:
  - A human-readable markdown document for business context (narrative).
  - A structured JSON file for objects, relationships, and implements (LLM-friendly input for YAML generation).
- Provide a preview in the UI prior to writing both files.

### Out of scope

- Detailed entity specifications, properties, constraints, or schema definitions (moved to a later phase).
- YAML emission for graph entities/containers/views (Phase 2X or later).

### UX and flows

#### A) Finish success flow (Phase 1)

- On successful `onFinish` completion:
  - Show a modal: “Foundation generated successfully.”
  - Actions:
    - Continue to Phase 2
    - Stay on Foundation
    - Return to Home page
    - Open repository folder (optional convenience)
- If “Continue to Phase 2” is chosen, navigate to `/tier01` with pre-seeded data from Phase 1 (personas, use cases, key questions).

#### B) Phase 2 – Modeling Context Wizard

- Steps (revised):
  1. Target Module
     - Select one existing module (discovered from Phase 1 skeletons) or create a new one.
     - If creating a new module, a skeleton `model_design.json` is created on Save and the module is added to selected environments.
  2. Purpose and Scope
     - Overview (required), optional business outcomes, success criteria, and constraints.
  3. Personas & Problems
     - Persona name (required), optional role, optional pain points (problems to solve). Optionally add module-level problems.
  4. Objects, Implements & Relationships (structured)
     - Object inventory with short descriptions.
     - Implements mapping to CDM types from `cdf_cdm` (see Core Data Model reference: https://docs.cognite.com/cdf/dm/dm_reference/dm_core_data_model).
     - Relationships between objects with explicit endpoints, direction, cardinality, and optional properties.
     - Cross-module: pick objects/entities from other modules to copy into the current module.
  5. Review & Generate
     - Preview markdown and JSON; write to module; show success modal.

### Data captured (draft shape)

- `specVersion`: string (e.g., "phase2-1")
- `module`: string
- `purpose`: { overview: string, outcomes?: string[], successCriteria?: string[], constraints?: string[] }
- `personas`: Array<{ name: string, role?: string, painPoints?: string[] }>
- `problems`?: string[] (module-level problems to solve)
- `objects`: Array<{ name: string, description?: string, tags?: string[], relatedModules?: string[], implements?: Array<{ space: string, externalId: string, version?: string }> }>
- `relationships`: Array<{
    label?: string,
    from: string,
    to: string,
    direction?: "A_TO_B" | "B_TO_A" | "BIDIRECTIONAL",
    cardinality?: "ONE_TO_ONE" | "ONE_TO_MANY" | "MANY_TO_MANY",
    description?: string,
    propertyName?: string,
    inversePropertyName?: string,
    modulesInvolved?: string[],
    properties?: Array<{ name: string, type?: string, description?: string }>
  }>

### Output artifacts

- `modules/<module>/docs/modeling_context.md`
  - Human-readable narrative: purpose, optional outcomes/success criteria/constraints, personas, pain points, and high-level notes.
- Preferred (unified): `modules/<module>/docs/model_design.json`
  - Single-file structured design (Phase 2 + Phase 3 seeds) validated by Zod: `ModelDesignZ` from `@docs-as-code/shared-types`
  - Contains objects, implements, relationships, and may include `entities[]` added in Phase 3
- Split (still supported): `modules/<module>/docs/model_overview.json` (Phase 2 only)
  - Validated by Zod: `ModelOverviewZ` from `@docs-as-code/shared-types`

Phase 1 integration:
- When Phase 1 creates modules, it also creates a per-module skeleton `model_design.json` with defaults:
  - `{ specVersion: "phase2-1", module: <name>, modelVersion: "1", purpose: { overview: "" }, objects: [], relationships: [], entities: [] }`
  - This enables Phase 2 to immediately select modules and add objects/entities.

### Markdown vs JSON boundaries (explicit)

- Markdown (`modeling_context.md`) — human narrative only:
  - Purpose overview; optional outcomes, success criteria, constraints
  - Personas (name, optional role) and optional pain points
  - Problems to Solve (optional)
  - Object inventory at a high level (names + short descriptions)
  - Implements and Relationships summarized in prose (human-readable summary, not the full structured detail)
  - Notes and assumptions

- JSON (preferred unified `model_design.json`, or split `model_overview.json`) — structured details for emitters/AI:
  - `specVersion`, `module`, `modelVersion`
  - `purpose` fields (machine-parseable mirrors of narrative)
  - `personas[]` with optional `painPoints[]`
  - `problems[]` (module-level)
  - `objects[]`: name, description, tags, relatedModules, `implements[]` ({ space, externalId, version? })
  - `relationships[]`: A/B endpoints (`from`, `to`), `direction`, `cardinality`, optional `label`, `propertyName`/`inversePropertyName`, `properties[]`
  - Only JSON is authoritative for implements/relationships structure; markdown is for readability
  - Optional `entities[]`: Phase 2 may create entity skeletons (name/description/tags/implements); Phase 3 enriches with sources/attributes/etc.

### Example templates

Markdown (`modules/<module>/docs/modeling_context.md`):

```markdown
# Modeling Context — Production Module

## 1. Purpose and Scope
- Overview: Enable daily production reconciliation across wells and facilities.
- Outcomes (optional):
  - Consistent daily net/gross volumes by facility and well
- Success Criteria (optional):
  - < 1% variance vs finance; daily refresh by 06:00 UTC
- Constraints (optional):
  - Source availability window 00:00–04:00 UTC

## 2. Personas
### Production Engineer (optional role: Engineer)
- Pain Points (optional):
  - Inconsistent daily counts across systems

## 3. Problems to Solve (optional)
- Reconcile per-well volumes to facility totals

## 4. Object Inventory
- oilWell: A producing well
- productionFacility: Facility that aggregates well production

## 5. Implements and Inter-Module Relationships
### Implements
- oilWell implements cognite:equipment (version v1)

### Relationships
- producesTo: oilWell → productionFacility — Daily produced volumes by target facility

## 6. Notes and Assumptions
- Daily reconciliation ignores test volumes
```

JSON unified (preferred) — `modules/<module>/docs/model_design.json`:

```json
{
  "specVersion": "phase2-1",
  "module": "production",
  "modelVersion": "0.1.0",
  "purpose": {
    "overview": "Enable daily production reconciliation across wells and facilities.",
    "outcomes": ["Consistent daily net/gross volumes"],
    "successCriteria": ["<1% variance", "Daily refresh by 06:00 UTC"],
    "constraints": ["Source availability window 00:00–04:00 UTC"]
  },
  "personas": [{ "name": "Production Engineer", "role": "Engineer", "painPoints": ["Inconsistent counts"] }],
  "problems": ["Reconcile per-well volumes to facility totals"],
  "objects": [
    {
      "name": "oilWell",
      "description": "A producing well",
      "implements": [{ "space": "cognite", "externalId": "equipment", "version": "v1" }]
    },
    { "name": "productionFacility", "description": "Aggregates well production" }
  ],
  "relationships": [
    {
      "label": "producesTo",
      "from": "oilWell",
      "to": "productionFacility",
      "direction": "A_TO_B",
      "cardinality": "ONE_TO_MANY",
      "propertyName": "producesTo",
      "properties": [
        { "name": "startTime", "type": "timestamp" },
        { "name": "endTime", "type": "timestamp" },
        { "name": "quantity", "type": "number" },
        { "name": "unit", "type": "string" }
      ]
    }
  ],
  "entities": []
}
```

Zod reference:
- `ModelDesignZ` (unified) or `ModelOverviewZ` (split) from `@docs-as-code/shared-types`

### Validation strategy (Save-time)

- Validate only the current step slice with Zod (partial validation). Example:
  - Purpose & Scope step → validate `purpose`
  - Personas step → validate `personas[]`
  - Objects step → validate `objects[]`
  - Relationships step → validate `relationships[]`
- On validation errors: show warnings/errors consistent with Foundation; allow Continue Anyway when appropriate.
- On Save: drop unknown keys; normalize and write JSON; update only corresponding section of `modeling_context.md`.

### Cardinality and relationship mapping (CDM alignment)

- `direction`: `A_TO_B` / `B_TO_A` / `BIDIRECTIONAL` → emitted as one or two directed relations.
- `cardinality`:
  - `ONE_TO_ONE` → single reference field in the view
  - `ONE_TO_MANY` → array reference from A to B
  - `MANY_TO_MANY` → modeled as two arrays or via typed edges, depending on emitter strategy
- `propertyName`/`inversePropertyName`: preferred field names for relation properties in views.
- Tooltips implemented: explain `A`/`B`, direction, and 1:1 vs 1:N vs M:N with CDM-aligned guidance.

### Markdown structure (generated)

```markdown
# Modeling Context — <Module Name>

## 1. Purpose and Scope
- Overview: <text>
- Outcomes (optional):
  - <bullet>
- Success Criteria (optional):
  - <bullet>
- Constraints (optional):
  - <bullet>

## 2. Personas
### <Persona Name> (optional role: <Role>)
- Pain Points (optional):
  - <bullet>

## 3. Problems to Solve (optional)
- <bullet>

## 4. Object Inventory
- <Object Name>: <short description>
- Tags: <tag, tag>
- Related Modules: <module, module>

## 5. Implements and Inter-Module Relationships
### Implements
- <Object Name> implements <space>:<externalId> (version <version>)

### Relationships
- <Type>: <from> → <to> — <description>

## 6. Notes and Assumptions
- <bullet>
```

### Technical design

- Routing
  - Add `/tier01` route and `Tier01Page` placeholder.

- Phase 1: success modal
  - In `WizardShell`, after successful `onFinish`, set a `finishSuccess` flag and show a `ConfirmModal` with the CTA.
  - Action “Continue to Phase 2” navigates to `/tier01`.

- Phase 2: page and services
  - `features/tier01/Tier01Page.tsx` built on `WizardShell` and `FormRenderer`.
  - UI schemas under `forms/ui-schemas/tier01/` and optional data schemas under `forms/data-schemas/tier01/`.
  - `services/tier01.ts`: `emitModelContextMarkdown(data: any): Promise<string>`, `emitModelOverviewJson(data: any): Promise<string>` and writers using `FileBridgeClient`.
  - On Finish: write `modules/<module>/docs/modeling_context.md` and `modules/<module>/docs/model_overview.json`, mkdirp as needed.
  - Shared IO utilities: use `src/services/io.ts` (`safeReadJson`, `writeJson`, `readYamlFile`, `writeYamlFile`) for consistent read/write across phases.

- Data seeding
  - Preload from Tier 00 UI-state: personas and key questions.
  - Map key questions to module-level `problems` and/or persona `painPoints`.

- Preview
  - Provide a Review step with markdown and JSON previews. Inline manual edits are deferred in the PoC.

- Accessibility
  - Modals focus trap, keyboard navigation, `aria-live` for success feedback.

### Component reuse

- Wizard framework (no new nav components)
  - Reuse `WizardShell`, `WizardProvider`, `StepSidebar`, `FooterNav`, `WizardProgress` from `src/components/wizard/`.
  - Keep dirty-state handling, validation warnings, and command error handling as-is.
- Dialogs
  - Reuse `ConfirmModal` from `@docs-as-code/ui-components` via existing wrappers in `src/components/wizard/Modals.tsx`.
  - Use the same modal pattern for the Phase 1 success dialog (no new modal component).
- Forms
  - Reuse `FormRenderer` from `@docs-as-code/form-renderer` with UISchema-defined fields.
  - Prefer existing controls; only add fields if absolutely necessary.
- Pickers and common components
  - Reuse `ModulePicker` from `src/components/common/ModulePicker.tsx` for module selection.
  - Consider `ListPicker`/`ObjectPicker` if helpful for objects/relationships; avoid new pickers initially.
- Preview
  - Reuse `JsonExplorer` (`src/components/common/JsonExplorer.tsx`) to preview `model_overview.json`.
  - For markdown, start with a simple `<pre>` preview in the content area (no new markdown renderer initially).
- File I/O and app context
  - Reuse `FileBridgeClient` for reading/writing artifacts and `ProjectContext` for `projectRoot` and bridge URL.
  - Follow the write patterns used in `Tier00Page` (mkdirp, write, non-blocking notifications).

### Cross-model references (catalog + multi-select)

- Goals
  - Allow users to select references across the CDF Core Data Model, Process Industrial Data, and locally defined objects in the repo.
  - Support two use cases in Step 4: Implements and Related Objects (cross-module references).

- UI
  - Implements picker sources:
    - CDM Core (pinned, `cdf_cdm`): curated implementable concepts/features (for example, `CogniteAsset`, `CogniteEquipment`, `CogniteActivity`, `CogniteTimeSeries`, `CogniteDescribable`, `CogniteSchedulable`). See official docs: https://docs.cognite.com/cdf/dm/dm_reference/dm_core_data_model
    - Local implements (discovered): unique `{space, externalId, version}` triples scanned from local modules.
    - Users can also enter custom `space:externalId@version`.
  - Related Objects: cross-module object copy is supported (relationship linking deferred).

- Catalog sources
  - Static catalogs (checked in): curated JSON files listing well-known CDF Core and Process Industrial Data types with `{ space, externalId, version, label }`.
  - Local repository scan:
    - Phase 2 JSON: `modules/*/docs/model_overview.json` to extract `objects[].name` per module.
    - Existing YAML: `modules/*/(views|containers)/*.yaml` to extract `{ space, externalId, version }` for implementable views.
    - Use `parseYaml` to read YAML; handle failures safely.
  - Future (optional): remote fetch from CDF project to enrich/validate picks.
  - Versioning: pin catalogs to a known CDM version (e.g., `cdf_cdm v1`) and store under `src/config/catalogs/`. Provide a simple update script or manual replacement flow.

- Data mapping
  - Implements selector → `objects[].implements[]` with entries `{ space, externalId, version? }` for CDF types and any local views that have resolvable triples.
  - Related Objects selector → add `relationships[]` entries with a default `type: "relatedTo"` (or user-selectable), `{ from: <this object>, to: <module/object>, description?: string }`.
  - If a local pick lacks a resolvable `{ space, externalId }` (not yet defined), store as `{ module: string, object: string }` in the relationship until Phase 3 defines the view; a later resolver can upgrade it.

- Relationship property suggestions (PoC)
  - Offer a starter list for `relationships[].properties[]`: `startTime`, `endTime`, `quantity`, `unit`, `confidence`, `source`.
  - Users can add free-form properties; avoid attempting to de-duplicate with implements at this stage.
  - If an object implements a CDF type that already includes similar attributes, we will still allow custom relationship properties (keep PoC simple; no inheritance-based filtering).

### Relationship labeling, endpoints, directionality, and cardinality

- Goals
  - Prevent invalid free-form relationship labels by constraining to a curated catalog aligned with CDF/CDM usage and Toolkit YAML generation needs.
  - Support directionality and a simple bi-directional toggle that materializes as two directed relations in generation.

- UI
  - Label (optional, free text with autocomplete over locally used labels). No hard-coded list; suggestions come from local usage.
  - Endpoints: pick object A and object B explicitly (from the module objects list); show both selections.
  - Direction selector: `A → B`, `B → A`, `Bi-directional`.
  - Cardinality selector: `1:1`, `1:N`, `M:N` mapped to `ONE_TO_ONE`, `ONE_TO_MANY`, `MANY_TO_MANY`.
  - Property names (optional): `propertyName` for A→B; `inversePropertyName` for B→A (used for view relation fields where applicable).
  - When Bi-directional is selected, store one entry with `direction: "BIDIRECTIONAL"` and generate two directed relations downstream; `inversePropertyName` will be used for the reverse.

- Data model
  - `relationships[].label?` optional free text (autocomplete suggestions from catalogs); no hard-coded enum.
  - `relationships[].direction?: "A_TO_B" | "B_TO_A" | "BIDIRECTIONAL"` (default `A_TO_B`).
  - `relationships[].cardinality?: "ONE_TO_ONE" | "ONE_TO_MANY" | "MANY_TO_MANY"` (default `ONE_TO_ONE`).
  - `relationships[].propertyName?` and `inversePropertyName?` for view relation naming.
  - `relationships[].properties[]` continues to support suggested keys.

- Generation mapping (informational)
  - Phase 3 will translate each relationship into view relation definitions: direction selects the edge orientation; `BIDIRECTIONAL` yields two relations.
  - Cardinality is enforced in the emitted view property type (single vs array) and constraints where applicable.
  - `propertyName`/`inversePropertyName` will map to relation field names in the respective views.
  - Exact YAML property names follow the Toolkit YAML reference for views/relations.

### User guidance (steering prompts)

- Purpose and Scope
  - “In one paragraph, what outcome should this module enable?”
  - “List 1–3 business outcomes (optional).”
  - “List 1–3 success criteria in measurable terms (optional).”
- Personas & Problems
  - “Name a persona and 1–3 pain points this model solves (optional).”
- Objects
  - “List the core objects you will reason about (short names + 1-line descriptions).”
- Implements
  - “If a custom object corresponds to a CDF core view (e.g., CogniteEquipment), pick it in Implements.”
- Relationships
  - “Add relationships between objects. Use starter properties like startTime/endTime/quantity/unit as needed. Keep descriptions short.”

### Updating Foundation artifacts (Phase 2 module creation)

- Goal
  - When a new module is created in Phase 2, ensure Phase 1 artifacts reflect it, including environment selections.

- Module scaffolding (reuse)
  - Call `addModulesIfNeeded(client, [name], true)` to create the module and scaffold subdirectories.
  - Call `writeModuleToml(client, name, tags?)` to ensure `module.toml` exists and tags are persisted.

- UI-state source of truth
  - Read `project_templates/ui-state/00_toolkit.json` and add the module to the `modules` list if missing.
  - Optionally update `environments[].selectedModules` to include the new module for any environments chosen in Phase 2.
  - Write the updated UI-state back to disk to keep Tier 00 consistent.

- Environment config updates
  - Preferred path (in-place update): for each chosen environment (e.g., `dev`), read `config.<env>.yaml`, union the module name into `environment.selected`, and write it back. Preserve existing keys.
  - Fallback path (if a config file is missing): update UI-state `environments[].selectedModules` and use existing services to build and `writeConfigFiles` for the missing environments.
  - Validation notes: in-place updates preserve `environment.project`; the fallback writes only succeed for envs with a `cdf_project` in UI-state.

- Idempotence and error handling
  - All updates are idempotent (set-union semantics). If a module already exists or is already selected, no duplicate entries are produced.
  - Reuse the existing command failure modal for any `cdf` or write errors and provide Retry.

- UX
  - In Phase 2, provide a checklist of existing environments for “Add this module to environments.” Default to `dev` if present. Persist choices as above.

### Open questions

- If multiple modules exist, should we allow generating multiple documents in one pass or one-at-a-time?
- Preferred filenames: keep `modeling_context.md` + `model_overview.json`?
- Implements references: allow shorthand `space:externalId` strings in addition to object form?

### Acceptance criteria

- After Phase 1 Finish success, a modal confirms success and offers “Continue to Phase 2.”
- `/tier01` renders a wizard that captures the described context and previews markdown and JSON.
- On Finish, both `modules/<module>/docs/modeling_context.md` and `modules/<module>/docs/model_design.json` are written successfully.
- If a new module is created in Phase 2 and environments are selected (e.g., `dev`), then `config.<env>.yaml` contains the module under `environment.selected` and Tier 00 UI-state reflects the new module.
- JSON includes `objects[].implements[]` with `{ space, externalId, version? }` entries where applicable.
- Relationship entries enforce type from a curated dropdown and include a `direction` field. Bi-directional selections are honored.
- If write fails, an error modal shows stderr/details and Retry works.

### Version management (PoC)

- Goals
  - Capture a model-level version in Phase 2 and propagate it to tags/metadata so Phase 3 and deployments can reflect changes over time.

- Data shape
  - Add `modelVersion: string` at the top level of `model_overview.json`.
  - Encourage including view `version` on `objects[].implements[]` when referencing CDF types.

- Persistence
  - On write, ensure `modules/<module>/module.toml` has a tag reflecting version, e.g., `[packages] tags = ["model:<module>@<modelVersion>", ...]` (preserve existing tags).
  - Optionally add an environment variable in `config.<env>.yaml` under `variables.models[<module>] = <modelVersion>` if useful for pipelines (non-blocking).

- Alignment with CDM
  - CDM models and views are versioned. Phase 3 emitters will set view/container versions explicitly; Phase 2 `modelVersion` serves as the user-facing semantic version for the conceptual model.

- Out of scope
  - Mutating `cdf.toml` beyond `min_version` or `modules_path` is not required for PoC.

### Implementation plan (high-level)

- Add success modal flow in Phase 1 and wire `Continue` to `/tier01`.
- Introduce `/tier01` route and `Tier01Page` scaffold.
- Define Phase 2 UI schemas and integrate with `WizardShell`.
- Implement markdown and JSON emitters and writers in `services/tier01.ts`.
- Add basic unit tests for both emitters and file writing paths.

### Risks and mitigations

- Users may not have selected or created a module yet → prompt to create/select in Step 1.
- Large or vague inputs could produce low-signal docs → provide field guidance and examples.

### Estimate

- Phase 1 success modal and routing hook: 0.5–1 day.
- Phase 2 MVP (steps, emitter, write, preview): 2–3 days.
- Tests and polish: 0.5–1 day.


