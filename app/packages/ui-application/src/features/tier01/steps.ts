import type { WizardStep } from '../../components/wizard/types.js';
import { ALL_KNOWN_VIEWS } from '../../forms/registry/index.js';

export const tier01Steps: WizardStep[] = [
  {
    id: 'basics',
    title: 'Module Basics',
    uiSchema: { fields: [ { kind: 'number', id: 'schemaVersion', label: 'Schema Version', placeholder: '1' }, { kind: 'text', id: 'moduleId', label: 'Module ID', placeholder: 'e.g., well_performance', help: 'Snake_case module identifier used across 01/XX.' } ] },
    validate: (d: any) => (!d?.moduleId ? { ok: false, message: 'moduleId is required' } : { ok: true })
  },
  {
    id: 'objects',
    title: 'Objects',
    uiSchema: { fields: [ { kind: 'array', path: 'objects', label: 'Objects', addLabel: 'Add', removeLabel: 'Remove', render: 'table', columns: ['name', 'objectId', 'space', 'viewExternalId', 'containerExternalId'], pageSize: 20, actions: [ { label: 'Open XX', hrefTemplate: '/tierXX?step=basics&moduleId={{moduleId}}&objectId={{objectId}}' } ], item: { kind: 'group', fields: [ { kind: 'text', id: 'name', label: 'Name', placeholder: 'e.g., Well' }, { kind: 'text', id: 'objectId', label: 'Object ID', placeholder: 'e.g., workOrder', help: 'LowerCamelCase' }, { kind: 'multiselect', id: 'implementsCore', label: 'Implements Core/Industry Views', placeholder: 'Search, e.g., asset, event', options: ALL_KNOWN_VIEWS }, { kind: 'text', id: 'space', label: 'Space', placeholder: 'e.g., sp_my_project_space' }, { kind: 'text', id: 'viewExternalId', label: 'View External ID', placeholder: 'my_module:view:work_order:v1' }, { kind: 'text', id: 'containerExternalId', label: 'Container External ID', placeholder: 'my_module:container:work_order:v1' } ] } } ] }
  },
  {
    id: 'relationships',
    title: 'Relationships',
    uiSchema: { fields: [ { kind: 'array', path: 'relationships', label: 'Relationships', addLabel: 'Add', removeLabel: 'Remove', item: { kind: 'group', fields: [ { kind: 'text', id: 'from', label: 'From', placeholder: 'e.g., Work Order' }, { kind: 'text', id: 'to', label: 'To', placeholder: 'e.g., Well' }, { kind: 'text', id: 'relationshipId', label: 'Relationship ID', placeholder: 'e.g., workOrder_performedOn_well' }, { kind: 'select', id: 'type', label: 'Type', options: [ { value: 'direct', label: 'direct' }, { value: 'edge', label: 'edge' } ] }, { kind: 'select', id: 'multiplicity', label: 'Multiplicity', options: [ { value: '1:1', label: '1:1' }, { value: '1:N', label: '1:N' }, { value: 'N:M', label: 'N:M' } ] }, { kind: 'text', id: 'label', label: 'Label', placeholder: 'e.g., performedOn' }, { kind: 'text', id: 'sourceResolution', label: 'Source Resolution', placeholder: 'join on ...' }, { kind: 'text', id: 'edgeSpace', label: 'Edge Space', placeholder: 'e.g., cdf_cdm', help: 'Required when type=edge.' }, { kind: 'text', id: 'edgeTypeExternalId', label: 'Edge Type External ID', placeholder: 'e.g., CogniteAssetRelationship', help: 'Required when type=edge.' } ] } } ] }
  },
  {
    id: 'external-references',
    title: 'External References',
    uiSchema: { fields: [ { kind: 'array', path: 'externalReferences', label: 'References', addLabel: 'Add', removeLabel: 'Remove', item: { kind: 'group', fields: [ { kind: 'text', id: 'externalModel', label: 'External Model' }, { kind: 'text', id: 'space', label: 'Space' }, { kind: 'arrayOfStrings', path: 'implements', label: 'Implements', addLabel: 'Add', removeLabel: 'Remove' } ] } } ] }
  },
  {
    id: 'data-model',
    title: 'Data Model',
    uiSchema: { fields: [ { kind: 'group', path: 'dataModel', fields: [ { kind: 'text', id: 'externalId', label: 'External ID' }, { kind: 'text', id: 'version', label: 'Version' }, { kind: 'arrayOfStrings', path: 'groupedViews', label: 'Grouped Views', addLabel: 'Add', removeLabel: 'Remove' } ] } ] }
  },
  {
    id: 'performance-hints',
    title: 'Performance Hints',
    uiSchema: { fields: [ { kind: 'group', path: 'performanceHints', fields: [ { kind: 'array', path: 'indexes', label: 'Indexes', addLabel: 'Add', removeLabel: 'Remove', item: { kind: 'group', fields: [ { kind: 'text', id: 'onObject', label: 'On Object' }, { kind: 'arrayOfStrings', path: 'fields', label: 'Fields', addLabel: 'Add', removeLabel: 'Remove' } ] } }, { kind: 'text', id: 'uniqueness', label: 'Uniqueness' } ] } ] }
  }
];


