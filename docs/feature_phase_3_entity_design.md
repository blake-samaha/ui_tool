## Feature: Phase 3 – Entity Design and YAML Resource Authoring

### Summary

- Phase 3 captures detailed, implementation-ready definitions of objects/entities introduced in Phase 2 and emits the corresponding Toolkit YAML resources (spaces, containers, views, transformations, datasets, functions, auth, etc.) inside the selected module(s).
- Aligns all tiers toward a single goal: repeatable, high-quality CDF Toolkit resources generated with AI assistance using Phase 2 context and Phase 3 structure.

### Final goal (north star)

- Given Phase 2 context (`modeling_context.md`, `model_overview.json`) and Phase 3 entity definitions, the system produces validated Toolkit YAMLs ready for build/deploy.
- Artifacts are consistent across tiers and idempotent on re-generation.

### Relationship to Phase 2 (alignment)

- Phase 2 provides:
  - Human context (narrative) and structured model overview (objects, implements, relationships).
  - Implements references to CDF data models and cross-module relationships.
- Phase 3 uses:
  - Phase 2 objects as the canonical list to elaborate.
  - Implements mapping to inform inheritance/typedef or alignment with CDF Core/PID.
  - Relationships to seed edge/view definitions.

### Scope (Phase 3)

- For each object in Phase 2:
  - Source systems (one or more) and lineage.
  - Attributes/fields with data types, constraints, defaults.
  - Data profiling notes (completeness, cardinality, uniqueness, ranges, nullability).
  - Validation/transformation logic (pre-ingest and post-ingest).
  - Identifiers and namespacing (spaces and externalIds policy) aligned with global standards.
  - Security and governance (auth groups, security categories as applicable).
- Derived resources to generate:
  - Spaces, Containers, Views (graph modeling), including relationships.
  - Transformations/pipelines referencing sources and mapping to destination entities.
  - Datasets, RAW tables (optional), and Functions when necessary.
  - Auth resources and variables derivable from global standards.

### Out of scope

- Business narrative capture (Phase 2 responsibility).
- Repository/project bootstrap (Phase 1 responsibility).

### UX and flows

- Steps (initial proposal):
  1. Select Objects to Detail
     - From Phase 2 list; pick one or many to edit in this session.
  2. Sources and Lineage
     - Source systems; tables; join keys; freshness; ownership.
  3. Attributes and Constraints
     - Field list with type, nullable, default, semantic tags; uniqueness; primary identifiers.
  4. Validation and Transformations
     - Data quality rules (plain English intent acceptable in MVP).
     - Transformation intent (plain English): describe the end result, expected shape, and examples of source tables/fields when known.
     - Optionally attach sample queries or snippets; AI assistant can propose concrete SQL later.
  5. Security and Standards
     - Spaces, naming conventions, auth groups, security categories.
  6. Relationships and Views
     - Edges/relations; view graph composition; implements guidance applied.
  7. Review & Generate
     - Preview YAMLs; write to module; success modal.

### Data captured (draft shape)

- `specVersion`: string (e.g., "phase3-1")
- `module`: string
- `entities`: Array<{
    name: string,
    space: string,
    externalId: string,
    implements?: Array<{ space: string, externalId: string, version?: string }>,
    sources: Array<{
      system: string,
      resource: string,
      description?: string,
      keys?: string[]
    }>,
    attributes: Array<{
      name: string,
      type: string,
      nullable?: boolean,
      default?: string | number | boolean,
      description?: string,
      tags?: string[]
    }>,
    constraints?: Array<{
      kind: 'primary' | 'unique' | 'foreign' | 'check',
      fields: string[],
      expression?: string
    }>,
    validations?: Array<{
      name: string,
      intent: string, // plain English description of the validation
      severity?: 'warning' | 'error'
    }>,
    transformations?: Array<{
      name: string,
      intent: string, // plain English desired outcome of the transform
      sourceHints?: Array<{ system?: string, resource?: string, fields?: string[] }>,
      notes?: string
    }>,
    security?: {
      groups?: string[],
      categories?: string[]
    },
    relationships?: Array<{
      type: string,
      to: { space: string, externalId: string, version?: string } | { module: string, object: string },
      description?: string
    }>
  }>

### Output artifacts

- Toolkit YAML files under `modules/<module>/`:
  - `spaces/`, `containers/`, `views/`, `transformations/`, `datasets/`, `functions/`, `auth/` as applicable.
- Preferred (unified): append `entities[]` into `modules/<module>/docs/model_design.json` (validated by `ModelDesignZ`)
- Split (supported): `modules/<module>/docs/entity_specs.json` (validated by `EntitySpecsZ`)

Phase 1/2 integration:
- Phase 1 creates per-module `model_design.json` skeletons.
- Phase 2 may add initial entity skeletons (name/description/tags/implements) so Phase 3 can enrich them.

### Markdown vs JSON boundaries (explicit)

- Markdown (`modeling_context.md` from Phase 2) remains the human narrative source of business context and should not be overloaded with technical specifics.

- JSON unified (`model_design.json`) or split (`entity_specs.json`) and emitted YAML are the technical sources of truth:
  - `entities[]` definitions (sources, attributes, constraints, validations intent, transformation intent, security, relationships)
  - Implements carried over from Phase 2, potentially expanded with concrete view/container refs
  - YAML files are generated from these structures and validated with Toolkit

Markdown generation/editing:
- Use the shared markdown utility: `generateModelingContextMarkdownFromParts` and `writeMarkdown` from `src/services/markdown.ts`.
- Phase 3 may update only relevant sections (personas, objects, relationships) while preserving other content.

### Versioning

- Manual version bump field in `model_design.json.modelVersion` (integer or decimal per CDF guidance).
- CDM view/container versions are set in emitted YAML; `modelVersion` is for the module-level conceptual document.

### Markdown structure reference

- See Phase 2 for the markdown sections. Phase 3 does not add new narrative sections; instead it adds structured detail that results in YAML.

### Example templates

JSON unified (preferred) — `modules/<module>/docs/model_design.json` (showing only entities block):

```json
{
  "specVersion": "phase3-1",
  "module": "production",
  "entities": [
    {
      "name": "oilWell",
      "space": "prod_space",
      "externalId": "oilWell",
      "implements": [{ "space": "cognite", "externalId": "equipment", "version": "v1" }],
      "sources": [{ "system": "hist", "resource": "wells", "keys": ["well_id"] }],
      "attributes": [
        { "name": "name", "type": "string", "nullable": false },
        { "name": "status", "type": "string" }
      ],
      "validations": [{ "name": "status_known", "intent": "status is one of ACTIVE/INACTIVE" }],
      "transformations": [{ "name": "normalize_status", "intent": "map source status codes to canonical values", "sourceHints": [{ "system": "hist", "resource": "wells", "fields": ["status_code"] }] }],
      "relationships": [
        { "type": "producesTo", "to": { "module": "production", "object": "productionFacility" }, "description": "well produces to facility" }
      ]
    }
  ]
}
```

Zod reference:
- `ModelDesignZ` (unified) or `EntitySpecsZ` (split) from `@docs-as-code/shared-types`

### Technical design

- Reuse and extend services from Phase 1/2:
  - Use `FileBridgeClient` for R/W.
  - Build YAML emitters for containers/views/transformations.
  - Use Phase 2 `model_overview.json` as seed for entities and implements.
  - Shared IO utilities: use `src/services/io.ts` (`safeReadJson`, `writeJson`, `readYamlFile`, `writeYamlFile`) to standardize file IO.
- Validation
  - Validate generated YAML with local schema checks before write.
  - Idempotent writes; preserve manual edits via merge strategies when feasible.
- AI assistant integration
  - Combine Phase 2 markdown + JSON and Phase 3 structured specs to propose YAML diffs; user approves and writes.

### Component reuse

- Wizard components: `WizardShell`, `WizardProvider`, `StepSidebar`, `FooterNav`, modals.
- Forms: `FormRenderer` with reusable inputs; `JsonExplorer` for previews.
- Catalog: reuse Phase 2 `services/catalog.ts` for core/process/local view references.

### Open questions (alignment with Phase 2)

- Where to draw the line between Phase 2 relationships and Phase 3 view/edge details?
 - Auto-suggest attributes when implementing CDF types: If an entity implements a CDF type (e.g., `cognite:equipment`), should we auto-populate a suggested attribute checklist based on that type's canonical attributes (e.g., `name`, `description`, `parent`, `createdTime`)? Users could accept/reject suggestions before finalizing Phase 3 attributes. Example: custom `oilWell` implements `CogniteEquipment` → suggest `name`, `description`, `assetSubtree` as starting fields.
- How to handle versioning when referenced CDF types change?
- Do we allow free-form SQL blocks, or constrain to templates?

### Acceptance criteria

- Users can pick objects from Phase 2 and define full specs.
- YAML files are generated under the module with valid structure and pass local validation.
- Implements and relationships from Phase 2 are reflected in views/edges.
- Regeneration is idempotent; errors are surfaced with retry.

### Initial estimates

- YAML emitters and writers: 3–5 days.
- Forms for attributes/constraints/validations: 3–4 days.
- View/relationship mapping and previews: 2–3 days.
- Tests and polish: 1–2 days.


