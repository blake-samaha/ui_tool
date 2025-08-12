---
templateType: object-spec
schemaVersion: 1
moduleId: "<snake_case_module>"
objectId: "<camelCaseObjectId>"
---

# Business Object: `<REPLACE_ME: The name of this object, e.g., "Well">`

<!--
This document defines the detailed specification for a single business object.
As the Solution Architect, your goal is to fill in all placeholders.
A separate file should be created for each object in your Conceptual Data Model.
-->

- **Author:** `<REPLACE_ME: Your Name>`
- **Date:** `<REPLACE_ME: YYYY-MM-DD>`
- **Version:** `1.0`

______________________________________________________________________

## 1. Description

- **Summary:**
  `<REPLACE_ME: A one-paragraph summary of what this business object represents.>`
- **External ID:**
  `<REPLACE_ME: Unique external ID for this object. Use snake_case. e.g., well_master_data>`
  
### Identifiers

- **View External ID:** `<REPLACE_ME: e.g., {{ moduleId }}:view:well:v1>`
- **Container External ID:** `<REPLACE_ME: e.g., {{ moduleId }}:container:well:v1>`

______________________________________________________________________

## 2. Data Source & Lineage

- **Source System:**
  `<REPLACE_ME: The name of the system providing the data, e.g., "SAP S/4HANA">`
- **Space:** `<REPLACE_ME: Target space for this object's instances>`
- **Primary RAW Table:**
  `<REPLACE_ME: The specific RAW table where the source data resides, e.g., "sap_zpm_workorders">`
  
- **Lineage:**
  - **Inputs:** `["raw:<db>.<table>"]`
  - **Outputs:** `["dm:<space>.<container>"]`

______________________________________________________________________

## 3. Properties

<!--
Define all the properties for this object. Copy this entire block for each new property.
The AI will map these properties to a CDF Container and View.
-->

- **Property:**
  - **Name:**
    `<REPLACE_ME: The desired property name in camelCase, e.g., workOrderNumber>`
  - **Data Type:**
    `<REPLACE_ME: text | int32 | int64 | float32 | float64 | boolean | timestamp | json>`
    <!--
    - `text` = A string
    - `int32` / `int64` = 32 or 64-bit integer
    - `float32` / `float64` = 32 or 64-bit floating point number
    - `timestamp` = An ISO 8601 timestamp with timezone
    -->
  - **Nullable:** `<REPLACE_ME: true|false>`
        <!-- Can this property be empty? -->
  - **Source Field:**
    `<REPLACE_ME: The exact column name from the RAW table, e.g., "AUFNR">`
  - **Description:**
    `<REPLACE_ME: A clear, concise description of the property.>`
  - **Transformation Rule:**
    `(Optional) <REPLACE_ME: A specific SQL expression if the mapping is not direct, e.g., "COALESCE(column_name, 'Unknown')">`

### Container Specification

- **Primary Key:**
  - `<REPLACE_ME: propertyName>`
- **Required:**
  - `<REPLACE_ME: propertyName>`
- **Unique:**
  - `<REPLACE_ME: propertyName>`
- **Indexes:**
  - **name:** `<REPLACE_ME: idx_property>`
    - **fields:** `{"<REPLACE_ME: propertyName>"}`

______________________________________________________________________

## 4. Relationships

<!--
Define how this object connects to other objects. Copy this block for each new relationship.
The AI will add these relationships to the object's View.
-->

- **Relationship:**
  - **Name:**
    `<REPLACE_ME: The desired relationship name in camelCase, e.g., "asset">`
  - **Data Type:** `direct` <!-- This should always be 'direct' for now. -->
  - **Source Field:**
    `<REPLACE_ME: The column in this object's RAW table that contains the key for the target object>`
  - **Target Type:** `<REPLACE_ME: The External ID of the target object's View>`
  - **Description:**
    `<REPLACE_ME: Explain the nature of the relationship, e.g., "A work order is performed on an asset.">`
  - **Type:** `<REPLACE_ME: direct|edge>`
        <!-- Learn-why: Direct for simple; edge for labeled/complex -->
  - **Multiplicity:** `<REPLACE_ME: 1:1|1:N|N:M>`
  - **Label:** `<REPLACE_ME: e.g., performedOn>`
  - **Resolution:** `<REPLACE_ME: join/mapping rule>`

______________________________________________________________________

## 5. View Configuration

<!-- Specify view-level details. Learn-why: Views define queryable interfaces and inheritance. -->

- **Implements:** `<REPLACE_ME: e.g., CogniteAsset v1>`
      <!-- Inherit from core models -->
- **Requires:** `<REPLACE_ME: e.g., ParentView>`

______________________________________________________________________

## 6. Time Series

<!--
(Optional) Define any time series that should be attached to instances of this object.
-->

- **Time Series:**
  - **Name:**
    `<REPLACE_ME: A descriptive name for the time series, e.g., "Annulus Pressure">`
  - **Source External ID Pattern:**
    `<REPLACE_ME: A pattern to find the source time series external ID. Use {{field_name}} to reference a property from this object, e.g., "acme:well:{{wellName}}:annulus_pressure">`
  - **Description:**
    `<REPLACE_ME: A clear description of what the time series measures.>`

______________________________________________________________________

## 7. Transformation Plan

- **External ID:** `<REPLACE_ME: tr_{{ moduleId }}_<objectId>>`
- **Engine:** `<REPLACE_ME: sql|function>`
- **Source:**
  - **type:** `raw`
  - **database:** `<REPLACE_ME: raw_db>`
  - **table:** `<REPLACE_ME: raw_table>`
- **Target:**
  - **containerExternalId:** `<REPLACE_ME>`
  - **upsertKeys:** `["<REPLACE_ME: primaryKey>"]`
  - **scdType:** `<REPLACE_ME: SCD1|SCD2>`
- **Schedule:**
  - **cron:** `<REPLACE_ME: e.g., 0 * * * *>`
  - **timezone:** `UTC`
- **Idempotent:** `true`
- **Backfill:**
  - **strategy:** `<REPLACE_ME: full|date_range>`
  - **from:** `<REPLACE_ME: YYYY-MM-DD>`

## 8. Data Quality

- **Rules:**
  - **name:** `not_null_<property>`
    - **type:** `not_null`
    - **field:** `<property>`
    - **severity:** `error`
  - **name:** `range_<property>`
    - **type:** `range`
    - **field:** `<property>`
    - **min:** `0`
    - **max:** `1000`

## 9. Observability & Orchestration

- **Owner:** `<REPLACE_ME: team_or_person>`
- **SLA:**
  - **freshness_minutes:** `<REPLACE_ME: 60>`
  - **max_error_rate_pct:** `<REPLACE_ME: 1>`
- **Alerts:**
  - **channel:** `<REPLACE_ME: slack://#data-alerts>`
- **Playbook External ID:** `<REPLACE_ME: pb_{{ moduleId }}_<objectId>>`
- **Tasks:**
  - **type:** `transformation`
    - **ref:** `${transformation.externalId}`
  - **type:** `contextualization`
    - **ref:** `<REPLACE_ME: ctx_task_external_id>`
