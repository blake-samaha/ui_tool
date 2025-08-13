
---

templateType: conceptual-model
schemaVersion: 1
moduleId: "<snake_case_module>"
---

# 01. Conceptual Data Model Overview

<!--
This document outlines the high-level structure of the data model.
Fill in the [placeholders] to define the core business objects and their relationships.
-->

## 1. Core Business Objects

<!--
List all the primary real-world entities or concepts that the data model will represent.
For each object, specify its type to guide the modeling process.
-->

- **Object:** `[e.g., Well]`
  - **Object ID:** `<REPLACE_ME: well>`
  - **Implements Core View(s):** `[CogniteAsset|CogniteEvent|CogniteFile|CogniteTimeSeries|CogniteSequence|CogniteEquipment]`
  - **View External ID:** `<REPLACE_ME: e.g., {{ moduleId }}:view:well:v1>`
  - **Container External ID:** `<REPLACE_ME: e.g., {{ moduleId }}:container:well:v1>`
  - **Space:** `<REPLACE_ME: e.g., sp_my_project_space>`
- **Object:** `[e.g., Work Order]`
  - **Object ID:** `<REPLACE_ME: workOrder>`
  - **Implements Core View(s):** `[CogniteEvent]`
  - **View External ID:** `<REPLACE_ME>`
  - **Container External ID:** `<REPLACE_ME>`
  - **Space:** `<REPLACE_ME>`

---

______________________________________________________________________

## 2. Relationships Between Objects

<!--
Define how the core business objects connect to each other.
This describes the essential graph structure of the model.
Add attributes for each relationship to specify details like type and multiplicity.
-->

- **Relationship:** `[Work Order]` -> `[Well]`
  - **Relationship ID:** `<REPLACE_ME: workOrder_performedOn_well>`
  - **Description:** `[A Work Order is performed on a Well.]`
  - **Type:** `<REPLACE_ME: direct|edge>`
  - **Multiplicity:** `<REPLACE_ME: 1:1|1:N|N:M>`
  - **Label:** `<REPLACE_ME: e.g., performedOn>`
  - **Source Resolution:** `<REPLACE_ME: e.g., join on workOrder.assetId -> well.externalId>`

- **Relationship:** `[Maintenance Report]` -> `[Work Order]`

  - **Description:**
    `[A Maintenance Report documents the results of a Work Order.]`
  - **Type:** `<REPLACE_ME: direct|edge>`
        <!-- direct for simple links; edge for complex/labeled connections -->
  - **Multiplicity:** `<REPLACE_ME: 1:1|1:N|N:M>`
  - **Label:** `<REPLACE_ME: e.g., documents>`

- **Relationship:** `[ProductionData]` -> `[Well]`

  - **Description:** `[Production Data is measured from a Well.]`
  - **Type:** `<REPLACE_ME: direct|edge>`
        <!-- direct for simple links; edge for complex/labeled connections -->
  - **Multiplicity:** `<REPLACE_ME: 1:1|1:N|N:M>`
  - **Label:** `<REPLACE_ME: e.g., measuredFrom>`

______________________________________________________________________

## 3. External References

<!-- Reference objects/models from other spaces for integration. This enables modular designs across projects. Learn-why: Avoid duplicating standard models like CogniteAsset. -->

- **Reference External Model:** `<REPLACE_ME: e.g., CogniteAsset>`
  - **Space:** `<REPLACE_ME: e.g., cdf_cdm>`
  - **Implements:** `<REPLACE_ME: e.g., CogniteCore.Asset v1>`

______________________________________________________________________

## 4. Module Data Model

<!-- Group views into a data model for the module. Learn-why: Data models bundle views for deployment and querying. -->

- **Data Model External ID:** `<REPLACE_ME: e.g., {{ moduleId }}:dm:well_performance>`
- **Version:** `<REPLACE_ME: e.g., v1>`
- **Grouped Views:** `<REPLACE_ME: e.g., {{ moduleId }}:view:WellView, {{ moduleId }}:view:WorkOrderView>`

## 5. Performance Hints (Optional)

- **Indexes:**
  - **On Object:** `<REPLACE_ME: objectId>`
  - **Fields:** `["<REPLACE_ME: property>"]`
- **Uniqueness:** `<REPLACE_ME: property or composite>`
