import type { UISchema } from '@docs-as-code/form-renderer';

export const Tier01UISchema: UISchema = {
    fields: [
        { kind: 'text', id: 'moduleId', label: 'Module ID', placeholder: 'e.g., well_performance', help: 'Snake_case module identifier used across 01/XX. See requirements 10.1.' },
        { kind: 'number', id: 'schemaVersion', label: 'Schema Version', placeholder: '1', help: 'Template schema version (integer). Keep at 1 unless migrating.' },
        {
            kind: 'array',
            path: 'objects',
            label: 'Objects',
            addLabel: 'Add object',
            removeLabel: 'Remove object',
            item: {
                kind: 'group',
                fields: [
                    { kind: 'text', id: 'name', label: 'Name', placeholder: 'e.g., Well' },
                    { kind: 'text', id: 'objectId', label: 'Object ID', placeholder: 'e.g., workOrder', help: 'LowerCamelCase object identifier. Pattern: ^[a-z][A-Za-z0-9]*$' },
                    { kind: 'text', id: 'space', label: 'Space', placeholder: 'e.g., sp_my_project_space' },
                    { kind: 'text', id: 'viewExternalId', label: 'View External ID', placeholder: 'my_module:view:work_order:v1' },
                    { kind: 'text', id: 'containerExternalId', label: 'Container External ID', placeholder: 'my_module:container:work_order:v1' }
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
                    { kind: 'text', id: 'from', label: 'From', placeholder: 'e.g., Work Order' },
                    { kind: 'text', id: 'to', label: 'To', placeholder: 'e.g., Well' },
                    { kind: 'text', id: 'relationshipId', label: 'Relationship ID', placeholder: 'e.g., workOrder_performedOn_well' },
                    { kind: 'select', id: 'type', label: 'Type', options: [
                        { value: 'direct', label: 'direct' },
                        { value: 'edge', label: 'edge' }
                    ]},
                    { kind: 'select', id: 'multiplicity', label: 'Multiplicity', options: [
                        { value: '1:1', label: '1:1' },
                        { value: '1:N', label: '1:N' },
                        { value: 'N:M', label: 'N:M' }
                    ]},
                    { kind: 'text', id: 'label', label: 'Label', placeholder: 'e.g., performedOn' },
                    { kind: 'text', id: 'sourceResolution', label: 'Source Resolution', placeholder: 'join on ...' },
                    { kind: 'text', id: 'edgeSpace', label: 'Edge Space', placeholder: 'e.g., cdf_cdm', help: 'Required when type=edge.' },
                    { kind: 'text', id: 'edgeTypeExternalId', label: 'Edge Type External ID', placeholder: 'e.g., CogniteAssetRelationship', help: 'Required when type=edge.' }
                ]
            }
        },
        { kind: 'group', label: 'Data Model', path: 'dataModel', fields: [
            { kind: 'text', id: 'externalId', label: 'External ID', placeholder: 'my_module:dm:well_performance' },
            { kind: 'text', id: 'version', label: 'Version', placeholder: 'v1' },
            { kind: 'arrayOfStrings', path: 'groupedViews', label: 'Grouped Views', addLabel: 'Add view', removeLabel: 'Remove view' }
        ]}
    ]
};

