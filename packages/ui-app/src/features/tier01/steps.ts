import type { UISchemaField } from '@docs-as-code/form-renderer';
import type { LocalEntityRef } from '../../services/catalog.js';
import type { ModelDesign } from '@docs-as-code/shared-types/dist/schemas/index.js';

export type StepsDeps = {
  modules: string[];
  envNames: string[];
  defaults: ModelDesign | null;
  labelSuggestions: string[];
  cdmTypes: Array<{ value: string; label: string }>;
  localImplOptions: Array<{ value: string; label: string }>;
  catalog: LocalEntityRef[];
};

export function buildTier01Steps({ modules, envNames, defaults, labelSuggestions, cdmTypes, localImplOptions, catalog }: StepsDeps) {
  return [
    {
      id: 'module',
      title: 'Target Module',
      uiSchema: {
        fields: [
          {
            kind: 'select',
            id: 'module',
            label: 'Module',
            options: modules.map((m) => ({ value: m, label: m })),
            help: 'Pick a module created in Phase 1 or create a new one by typing its name.'
          }
        ] as UISchemaField[]
      },
      validate: (data: any) => {
        const mod = String(data?.module || '').trim();
        return mod ? { status: 'valid' as const } : { status: 'error' as const, message: 'Module is required' };
      }
    },
    {
      id: 'environments',
      title: 'Environments',
      uiSchema: {
        fields: [
          {
            kind: 'arrayOfStrings',
            path: 'selectedEnvironments',
            label: 'Add module to environments',
            addLabel: 'Add environment',
            removeLabel: 'Remove',
            help: envNames.length ? `Available: ${envNames.join(', ')}` : 'No environments detected yet'
          }
        ]
      },
      validate: () => ({ status: 'valid' as const })
    },
    {
      id: 'purpose',
      title: 'Purpose & Scope',
      uiSchema: {
        fields: [
          {
            kind: 'group',
            path: 'purpose',
            label: 'Purpose',
            fields: [
              { kind: 'text', id: 'overview', label: 'Overview', placeholder: 'One-paragraph purpose statement' },
              { kind: 'arrayOfStrings', path: 'outcomes', label: 'Outcomes (optional)', addLabel: 'Add outcome', removeLabel: 'Remove' },
              { kind: 'arrayOfStrings', path: 'successCriteria', label: 'Success Criteria (optional)', addLabel: 'Add criteria', removeLabel: 'Remove' },
              { kind: 'arrayOfStrings', path: 'constraints', label: 'Constraints (optional)', addLabel: 'Add constraint', removeLabel: 'Remove' }
            ]
          }
        ]
      },
      validate: (data: any) => (data?.purpose?.overview ? { status: 'valid' as const } : { status: 'error' as const, message: 'Purpose is required' })
    },
    {
      id: 'personas',
      title: 'Personas & Problems',
      uiSchema: {
        fields: [
          {
            kind: 'array',
            path: 'personas',
            label: 'Personas',
            addLabel: 'Add persona',
            removeLabel: 'Remove',
            item: {
              kind: 'group',
              fields: [
                { kind: 'text', id: 'name', label: 'Name', placeholder: 'e.g., Production Engineer' },
                { kind: 'text', id: 'role', label: 'Role (optional)', placeholder: 'e.g., Engineer' },
                { kind: 'arrayOfStrings', path: 'painPoints', label: 'Pain Points (optional)', addLabel: 'Add pain point', removeLabel: 'Remove' }
              ]
            }
          },
          { kind: 'arrayOfStrings', path: 'problems', label: 'Problems to Solve (optional)', addLabel: 'Add problem', removeLabel: 'Remove' }
        ]
      },
      validate: (data: any) => {
        const hasEmpty = Array.isArray(data?.personas) && data.personas.some((p: any) => typeof p?.name === 'string' && p.name.trim().length === 0);
        return hasEmpty ? { status: 'warning' as const, message: 'Some personas have empty names', details: ['Provide a name or remove the row'] } : { status: 'valid' as const };
      }
    },
    {
      id: 'objects',
      title: 'Objects',
      uiSchema: {
        fields: [
          {
            kind: 'array',
            path: 'objects',
            label: 'Objects',
            addLabel: 'Add object',
            removeLabel: 'Remove',
            item: {
              kind: 'group',
              fields: [
                { kind: 'text', id: 'name', label: 'Name', placeholder: 'e.g., oilWell' },
                { kind: 'text', id: 'description', label: 'Description (optional)', placeholder: 'Short description' },
                {
                  kind: 'array',
                  path: 'implements',
                  label: 'Implements (CDF types)',
                  addLabel: 'Add type',
                  removeLabel: 'Remove',
                  help: 'Pick a CDM type (or enter custom). Use space:externalId@version shorthand or fill fields.',
                  item: {
                    kind: 'group',
                    fields: [
                      { kind: 'select', id: 'template', label: 'Pick from catalog (optional)', placeholder: 'e.g., CDM: CogniteEquipment (v1)', options: [...cdmTypes, ...localImplOptions] },
                      { kind: 'text', id: 'space', label: 'Space', placeholder: 'e.g., cognite', prefillFromPath: '../template' },
                      { kind: 'text', id: 'externalId', label: 'External ID', placeholder: 'e.g., equipment', prefillFromPath: '../template' },
                      { kind: 'text', id: 'version', label: 'Version (optional)', placeholder: 'e.g., v1', prefillFromPath: '../template' }
                    ]
                  }
                }
              ]
            }
          },
          {
            kind: 'multiselect',
            id: 'copyFrom',
            label: 'Copy from other modules',
            options: (catalog || []).map((r: LocalEntityRef) => ({ value: `${r.module}:${r.object}`, label: `${r.object} (${r.module})` }))
          }
        ]
      },
      validate: (data: any) => {
        const arr = Array.isArray(data?.objects) ? data.objects : [];
        const bad = arr.some((o: any) => !o?.name || String(o.name).trim().length === 0);
        return bad ? { status: 'warning' as const, message: 'Some objects are missing names', details: ['Provide a name or remove the row'] } : { status: 'valid' as const };
      }
    },
    {
      id: 'relationships',
      title: 'Relationships',
      uiSchema: {
        fields: [
          {
            kind: 'array',
            path: 'relationships',
            label: 'Relationships',
            addLabel: 'Add relationship',
            removeLabel: 'Remove',
            item: {
              kind: 'group',
              fields: [
                {
                  kind: 'text',
                  id: 'label',
                  label: 'Label (optional)',
                  placeholder: 'e.g., producesTo',
                  help: 'Optional human-readable label used in docs and naming suggestions. YAML uses property names for relations.',
                  suggestFrom: labelSuggestions.slice(0, 8).map((s) => ({ path: '$.uiSuggestions.relLabels.' + s, label: s }))
                },
                { kind: 'select', id: 'from', label: 'A (from)', placeholder: 'Example: oilWell', options: (defaults?.objects || []).map((o: any) => ({ value: o.name, label: o.name })) },
                { kind: 'select', id: 'to', label: 'B (to)', placeholder: 'Example: productionFacility', options: (defaults?.objects || []).map((o: any) => ({ value: o.name, label: o.name })) },
                { kind: 'select', id: 'direction', label: 'Direction', placeholder: 'Example: oilWell producesTo productionFacility → A_TO_B', options: [ { value: 'A_TO_B', label: 'A → B' }, { value: 'B_TO_A', label: 'B → A' }, { value: 'BIDIRECTIONAL', label: 'Bi-directional' } ] },
                { kind: 'select', id: 'cardinality', label: 'Cardinality', placeholder: 'Example: one oilWell to many productionFacility → ONE_TO_MANY', options: [ { value: 'ONE_TO_ONE', label: '1:1' }, { value: 'ONE_TO_MANY', label: '1:N' }, { value: 'MANY_TO_MANY', label: 'M:N' } ] },
                {
                  kind: 'array',
                  path: 'properties',
                  label: 'Properties (optional)',
                  addLabel: 'Add property',
                  removeLabel: 'Remove',
                  item: {
                    kind: 'group',
                    fields: [
                      { kind: 'text', id: 'name', label: 'Name', placeholder: 'e.g., startTime' },
                      { kind: 'text', id: 'type', label: 'Type (optional)', placeholder: 'e.g., timestamp, number, string' },
                      { kind: 'text', id: 'description', label: 'Description (optional)', placeholder: 'Short description' }
                    ]
                  }
                }
              ]
            }
          }
        ]
      },
      validate: (data: any) => {
        const rels = Array.isArray(data?.relationships) ? data.relationships : [];
        for (const r of rels) { if (!r?.from || !r?.to) return { status: 'warning' as const, message: 'Some relationships are missing endpoints', details: ['Select both A and B'] }; }
        return { status: 'valid' as const };
      }
    },
    {
      id: 'assign-model',
      title: 'Assign Data Model & Space',
      uiSchema: {
        fields: [
          {
            kind: 'group',
            path: 'dataModelAssignment',
            label: 'Data Model Identification',
            fields: [
              { kind: 'text', id: 'externalId', label: 'Data Model External ID', placeholder: 'e.g., myEnterpriseModel' },
              { kind: 'text', id: 'space', label: 'Space', placeholder: 'e.g., my_enterprise_space' }
            ]
          },
          {
            kind: 'arrayOfStrings',
            path: 'assignToEnvironments',
            label: 'Assign to environments (updates config.[env].yaml)',
            addLabel: 'Add environment',
            removeLabel: 'Remove',
            help: envNames.length ? `Available: ${envNames.join(', ')}` : 'No environments detected yet'
          }
        ] as UISchemaField[]
      },
      validate: (data: any) => {
        const dm = data?.dataModelAssignment || {};
        const ext = String(dm?.externalId || '').trim();
        const space = String(dm?.space || '').trim();
        if (!ext || !space) return { status: 'warning' as const, message: 'Provide data model externalId and space to assign' };
        return { status: 'valid' as const };
      }
    },
    { id: 'review', title: 'Review & Generate', uiSchema: { fields: [] as UISchemaField[] }, validate: () => ({ status: 'valid' as const }) }
  ];
}


