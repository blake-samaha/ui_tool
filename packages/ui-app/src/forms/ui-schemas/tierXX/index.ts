import type { UISchema } from '@docs-as-code/form-renderer';

export const TierXXUISchema: UISchema = {
    fields: [
        { kind: 'text', id: 'moduleId', label: 'Module ID', placeholder: 'e.g., well_performance', help: 'Snake_case module identifier. See requirements 10.1.' },
        { kind: 'text', id: 'objectId', label: 'Object ID', placeholder: 'e.g., workOrder', help: 'LowerCamelCase object identifier. Pattern: ^[a-z][A-Za-z0-9]*$' },
        { kind: 'number', id: 'schemaVersion', label: 'Schema Version', placeholder: '1' },
        { kind: 'group', label: 'Description', path: 'description', fields: [
            { kind: 'text', id: 'summary', label: 'Summary', placeholder: 'Short description of the object' },
            { kind: 'text', id: 'externalId', label: 'External ID', placeholder: 'work_order_master_data' }
        ]},
        { kind: 'group', label: 'Identifiers', path: 'identifiers', fields: [
            { kind: 'text', id: 'viewExternalId', label: 'View External ID', placeholder: 'my_module:view:work_order:v1' },
            { kind: 'text', id: 'containerExternalId', label: 'Container External ID', placeholder: 'my_module:container:work_order:v1' }
        ]},
        { kind: 'group', label: 'Data Source', path: 'dataSource', fields: [
            { kind: 'text', id: 'sourceSystem', label: 'Source System', placeholder: 'e.g., SAP S/4HANA' },
            { kind: 'text', id: 'space', label: 'Space', placeholder: 'e.g., sp_my_project_space' },
            { kind: 'text', id: 'primaryRawTable', label: 'Primary RAW Table', placeholder: 'e.g., sap_zpm_workorders' }
        ]},
        {
            kind: 'array',
            path: 'properties',
            label: 'Properties',
            addLabel: 'Add property',
            removeLabel: 'Remove property',
            item: {
                kind: 'group',
                fields: [
                    { kind: 'text', id: 'name', label: 'Name', placeholder: 'e.g., workOrderNumber' },
                    { kind: 'select', id: 'dataType', label: 'Data Type', options: [
                        { value: '', label: '' },
                        { value: 'text', label: 'text' },
                        { value: 'int32', label: 'int32' },
                        { value: 'int64', label: 'int64' },
                        { value: 'float32', label: 'float32' },
                        { value: 'float64', label: 'float64' },
                        { value: 'boolean', label: 'boolean' },
                        { value: 'timestamp', label: 'timestamp' },
                        { value: 'date', label: 'date' },
                        { value: 'json', label: 'json' },
                        { value: 'geojson', label: 'geojson' }
                    ]},
                    { kind: 'checkbox', id: 'nullable', label: 'Nullable' },
                    { kind: 'text', id: 'sourceField', label: 'Source Field', placeholder: 'e.g., AUFNR' },
                    { kind: 'text', id: 'description', label: 'Description', placeholder: 'What this property represents' }
                ]
            }
        },
        {
            kind: 'array',
            path: 'relationships',
            label: 'Relationships',
            addLabel: 'Add relationship',
            removeLabel: 'Remove relationship',
            item: {
                kind: 'group',
                fields: [
                    { kind: 'text', id: 'name', label: 'Name', placeholder: 'relationship name' },
                    { kind: 'select', id: 'type', label: 'Type', options: [
                        { value: 'direct', label: 'direct' },
                        { value: 'edge', label: 'edge' }
                    ]},
                    { kind: 'text', id: 'sourceField', label: 'Source Field' },
                    { kind: 'text', id: 'targetType', label: 'Target Type' },
                    { kind: 'select', id: 'multiplicity', label: 'Multiplicity', options: [
                        { value: '1:1', label: '1:1' },
                        { value: '1:N', label: '1:N' },
                        { value: 'N:M', label: 'N:M' }
                    ]},
                    { kind: 'text', id: 'label', label: 'Label', placeholder: 'e.g., performedOn' },
                    { kind: 'text', id: 'resolution', label: 'Resolution', placeholder: 'e.g., join via externalId' },
                    { kind: 'text', id: 'edgeSpace', label: 'Edge Space', placeholder: 'e.g., cdf_cdm', help: 'Required when type=edge.' },
                    { kind: 'text', id: 'edgeTypeExternalId', label: 'Edge Type External ID', placeholder: 'e.g., CogniteAssetRelationship', help: 'Required when type=edge.' }
                ]
            }
        }
    ]
};

