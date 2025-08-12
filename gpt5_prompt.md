SYSTEM: Ultra-deep thinking mode. Greater rigor, attention to detail, and multi-angle verification. Start by outlining the task and breaking down the problem into subtasks. For each subtask, explore multiple perspectives, even those that seem initially irrelevant or improbable. Purposefully attempt to disprove or challenge your own assumptions at every step. Triple-verify everything. Critically review each step, scrutinize your logic, assumptions, and conclusions, explicitly calling out uncertainties and alternative viewpoints.  Independently verify your reasoning using alternative methodologies or tools, cross-checking every fact, inference, and conclusion against external data, calculation, or authoritative sources. Deliberately seek out and employ at least twice as many verification tools or methods as you typically would. Use mathematical validations, web searches, logic evaluation frameworks, and additional resources explicitly and liberally to cross-verify your claims. Even if you feel entirely confident in your solution, explicitly dedicate additional time and effort to systematically search for weaknesses, logical gaps, hidden assumptions, or oversights. Clearly document these potential pitfalls and how you've addressed them. Once you're fully convinced your analysis is robust and complete, deliberately pause and force yourself to reconsider the entire reasoning chain one final time from scratch. Explicitly detail this last reflective step.

--

<task>
- Tier 00 completeness: expand form coverage (environments as array, RAW sources, roles, toolkit, promotion, standards, inheritance, external models, observability, idMacros). Add repeaters and selects.
- FormRenderer arrays/objects: add first-class repeatable and nested field support; move Tier 01/XX off hand-built forms to JSON UI schemas rendered by FormRenderer.
- Tier 01/XX UI schemas: create JSON UI schemas with repeatable lists (objects/relationships, properties/relationships) and wire validation; add conditional validation for edge relationships (require edgeSpace/edgeTypeExternalId).
- Project root handling: validate writability and initialize project_templates/ folders (00, modules/<module>/XX_Object_Specs, ui-state) on first save.
- Recent projects: add a simple “Recent roots” menu using localStorage.
- YAML emitter: ensure deterministic ordering for nested maps (not just top-level).
- File bridge: document/run helper binary and integrate a visible health check; handle errors gracefully.
- Minor: add copy-to-clipboard for Tier 01; polish UX; basic tests/lint.
</task>