## Best Practices for CDF Development

### Modeling fundamentals

- **Prefer interface-based, generic GraphQL designs**: Implement behaviors via interfaces and avoid company-specific names in types. This maximizes reuse and portability.
- **Model core asset constructs explicitly**: Use `AssetTag`, `FunctionalLocation`, and `Equipment` for clear separation of identity, position/role, and physical device.
    - **Temporary constraint**: Mixed hierarchies are not currently supported; implement `AssetTag` and populate it with Functional Location data until mixed hierarchies are available, then refactor.
- **Structure the data model across spaces (clear separation of concerns)**:
    - `source_models`: Preserve raw structures, naming, and lineage from source systems.
    - `enterprise_models/shared_common`: Enterprise-wide reusable entities, taxonomies, and CDM interfaces.
    - `enterprise_models/function_specific`: Department/function specializations (maintenance, operations, engineering, manufacturing, etc.).
    - `solution_models`: Denormalized, consumption-optimized views for applications.
    - `contextualization`: Models and state used by contextualization workflows.
- **Model asset hierarchy semantics**: Use parent/root/path relationships and typed links to children/equipment; avoid duplicating state when derivable.
- **Capture source lineage**: Include `sourceId`, `sourceContext`, and source timestamps to enable traceability and impact analysis.

### Contextualization workflows

- **Use a multi-step approach**: Metadata digestion, document digestion, reference cataloging, diagram detection, and entity matching.
- **Standardize key extraction**: Combine regex, fixed-width parsing, and token recombination. Maintain scope-aware aliasing rules to normalize identifiers.
- **Prefer resource-pattern detection**: Detect via patterns (e.g., P&ID symbols/text) rather than enumerating known entities to improve recall.
- **Reference index first**: Store `foundKey`, `resourceType`, `targetReference`, and coordinates for efficient matching and auditing.
- **Scale with robust batching**: Implement change detection, retries with thresholds, decomposition of large files, queue management, and result aggregation.

### Annotation framework (CDM-driven)

- **Model-driven configuration**: Centralize pipeline behavior in YAML; validate with Pydantic for type safety.
- **Workflow state via tags**: Use tags to drive lifecycle and observability: `DetectInDiagrams`, `ScopeWideDetect`, `ToAnnotate`, `AnnotationInProcess`, `Annotated`, `AnnotationFailed`.
- **Three-phase execution**:
    - Preparation: Select and initialize files; create `FileAnnotationState` instances.
    - Launch: Group by scope (site/unit), cache entities, start Diagram Detect jobs, update state to Processing.
    - Finalize: Collect results, create relationships, set success/failure tags, write RAW summaries.
- **Scope-based caching**: Load entity cache once per scope (site → unit → area) to reduce API calls by orders of magnitude.

### Configuration management

- **Environment-specific configs**: Tune batch sizes, thresholds, and retries per environment (dev vs prod). Keep secrets externalized.
- **Version rules**: Version extraction patterns and aliasing rules; support rollback.
- **Flexible scoping**: Support null/OR scoped queries to widen or tailor detection windows without code changes.

### Performance and scalability

- **Use CDM instances for state**: Prefer data model instances over RAW tables for state tracking (indexed queries, optimistic locking via versioning, typed schemas).
- **Process hierarchically and in parallel**: Traverse top-down, batch related entities, and parallelize independent branches.
- **Do delta processing**: Detect changes via source timestamps and only reprocess modified data.

### Data quality and validation

- **Enforce identity and integrity**: Unique constraints on codes/IDs, referential integrity checks, and cross-system consistency validation.
- **Validate temporal semantics**: Order and window checks for schedules, activities, and workflows.
- **Validate spatial consistency**: Ensure coordinates, bounding boxes, and spatial hierarchies align with reality.

### Monitoring, analytics, and operations

- **Track detection quality**: Monitor matched vs unmatched, and confidence distribution to tune patterns and thresholds.
- **Observe pipeline health**: Persist deployment/run fields (start/end times, batches, succeeded/failed/timeout) and highlight issues.
- **Classify and retain errors**: Categorize (configuration, source data, timeout, rate limit, validation), store details and stack traces, and support retry flows.
- **Dashboards for actionability**: Pipeline tracker, project metrics, and error detail dashboards to drive continuous improvement.

### Operational guidance

- **Developer workflow**: Use local env (.env) with CDF credentials, run small test sets, and attach debuggers for functions.
- **Deployment**: Manage via toolkit build/deploy; schedule workflows (cron) and verify dry runs before production deployment.
- **Auditing**: Record end-to-end lineage through CDM instances, RAW tables, and function logs.

### Quick reference

- **Core interfaces**: `CogniteDescribable`, `CogniteSourceable`, `CogniteAsset`, `CogniteEquipment`, `CogniteMaintenanceOrder`.
- **Key entities**: `AssetTag`, `FunctionalLocation`, `Equipment`, `WorkOrder`, `EnterpriseFile`.
- **Common commands**:
    - Build/deploy: `cdf build`, `cdf deploy` (use dry-run first).
    - Pipeline runs: Parameterize by scope (site/unit), batch size, and retry flags.

### Do/Don’t checklist

- **Do**: Use generic, interface-based models and split across spaces; cache by scope; track state in CDM.
- **Do**: Centralize configuration, version extraction/aliasing rules, and monitor confidence metrics.
- **Don’t**: Encode company names in schemas, mix hierarchies (until supported), or reprocess everything when only deltas changed.


