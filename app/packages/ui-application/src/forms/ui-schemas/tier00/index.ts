import type { UISchema } from '@docs-as-code/form-renderer';

export const Tier00UISchema: UISchema = {
    fields: [
        { kind: 'text', id: 'moduleId', label: 'Module ID',
          placeholder: 'e.g., well_performance',
          help: 'Snake_case identifier for the module. Used as a prefix in external IDs. Pattern: ^[a-z0-9]+(?:_[a-z0-9]+)*$ (see requirements 10.1 and 01/XX schemas).'},
        { kind: 'text', id: 'projectId', label: 'Project ID',
          placeholder: 'e.g., acme_upstream_2025',
          help: 'Optional human/project identifier for documentation. Not used by Toolkit directly.' },
        { kind: 'group', label: 'Space', path: 'space', fields: [
            { kind: 'text', id: 'externalId', label: 'Space External ID',
              placeholder: 'e.g., sp_my_project_space',
              help: 'External ID of the target DM space. Pattern: ^[a-z0-9_\-:.]+$ (see schemas). Often prefixed with sp_.' },
            { kind: 'text', id: 'description', label: 'Description',
              placeholder: 'Short description of the space' }
        ]},
        {
            kind: 'array',
            path: 'environments',
            label: 'Environments',
            addLabel: 'Add environment',
            removeLabel: 'Remove environment',
            item: {
                kind: 'group',
                fields: [
                    { kind: 'text', id: 'name', label: 'Name', placeholder: 'dev, prod', help: 'Environment name (e.g., dev, prod).'},
                    { kind: 'text', id: 'cdf_cluster', label: 'cdf_cluster', placeholder: 'e.g., westeurope-1' },
                    { kind: 'text', id: 'cdf_region', label: 'cdf_region', placeholder: 'e.g., eu-west-1' },
                    { kind: 'text', id: 'idp_tenant_id', label: 'idp_tenant_id', placeholder: 'UUID', help: 'Identity provider tenant ID (UUID).'},
                    { kind: 'text', id: 'admin_group_source_id', label: 'admin_group_source_id', placeholder: 'UUID', help: 'IdP group source ID for admin role.' },
                    { kind: 'text', id: 'user_group_source_id', label: 'user_group_source_id', placeholder: 'UUID', help: 'IdP group source ID for user role.' }
                ]
            }
        },
        {
            kind: 'array',
            path: 'rawSources',
            label: 'RAW Sources',
            addLabel: 'Add source',
            removeLabel: 'Remove source',
            item: {
                kind: 'group',
                fields: [
                    { kind: 'text', id: 'sourceSystem', label: 'Source System', placeholder: 'e.g., SAP S/4HANA' },
                    { kind: 'text', id: 'database', label: 'RAW Database', placeholder: 'e.g., raw_sap_s4hana' },
                    { kind: 'arrayOfStrings', path: 'tables', label: 'Tables', addLabel: 'Add table', removeLabel: 'Remove table' },
                    { kind: 'textarea', id: 'description', label: 'Description', placeholder: 'What data these tables contain' }
                ]
            }
        },
        { kind: 'group', label: 'Toolkit', path: 'toolkit', fields: [
            { kind: 'select', id: 'deployStrategy', label: 'Deploy Strategy', help: 'Toolkit apply strategy. upsert merges changes; replace overwrites.', options: [
                { value: '', label: '' },
                { value: 'upsert', label: 'upsert' },
                { value: 'replace', label: 'replace' }
            ]},
            { kind: 'checkbox', id: 'dryRun', label: 'Dry Run', help: 'If true, Toolkit performs a dry run without applying changes.' },
            { kind: 'group', label: 'Retries', path: 'retries', fields: [
                { kind: 'number', id: 'maxAttempts', label: 'Max Attempts', placeholder: 'e.g., 6' },
                { kind: 'select', id: 'backoff', label: 'Backoff', options: [
                    { value: '', label: '' },
                    { value: 'exponential', label: 'exponential' },
                    { value: 'linear', label: 'linear' },
                    { value: 'fixed', label: 'fixed' }
                ]},
                { kind: 'number', id: 'maxBackoffSeconds', label: 'Max Backoff Seconds', placeholder: 'e.g., 64' }
            ]}
        ]},
        { kind: 'group', label: 'Promotion', path: 'promotion', fields: [
            { kind: 'text', id: 'fromEnv', label: 'From Env', placeholder: 'e.g., dev' },
            { kind: 'text', id: 'toEnv', label: 'To Env', placeholder: 'e.g., prod' },
            { kind: 'arrayOfStrings', path: 'guardrails', label: 'Guardrails', addLabel: 'Add guardrail', removeLabel: 'Remove guardrail' }
        ]},
        {
            kind: 'array',
            path: 'accessRoles',
            label: 'Access Roles',
            addLabel: 'Add role',
            removeLabel: 'Remove role',
            item: {
                kind: 'group',
                fields: [
                    { kind: 'text', id: 'name', label: 'Name', placeholder: 'e.g., Data Administrator' },
                    { kind: 'text', id: 'sourceIdVariable', label: 'Source ID Variable', placeholder: '{{ admin_group_source_id }}' },
                    { kind: 'textarea', id: 'permissionsSummary', label: 'Permissions Summary', placeholder: 'High-level permission summary' },
                    { kind: 'arrayOfStrings', path: 'capabilities', label: 'Capabilities', addLabel: 'Add capability', removeLabel: 'Remove capability' }
                ]
            }
        },
        { kind: 'group', label: 'Global Standards', path: 'globalStandards', fields: [
            { kind: 'text', id: 'globalNamingConvention', label: 'Naming Convention', placeholder: 'e.g., prefix:scope:name' },
            { kind: 'text', id: 'timestampStandard', label: 'Timestamp Standard', placeholder: 'e.g., ISO 8601 UTC' },
            { kind: 'text', id: 'requiredPropertyForAllObjects', label: 'Required Property', placeholder: 'e.g., source_last_updated_time' }
        ]},
        { kind: 'group', label: 'Core Model Inheritance', path: 'coreModelInheritance', fields: [
            { kind: 'group', label: 'Asset View', path: 'assetView', fields: [
                { kind: 'text', id: 'space', label: 'Space', placeholder: 'cdf_cdm' },
                { kind: 'text', id: 'externalId', label: 'External ID', placeholder: 'CogniteAsset' },
                { kind: 'text', id: 'version', label: 'Version', placeholder: 'v1' }
            ]},
            { kind: 'group', label: 'Event View', path: 'eventView', fields: [
                { kind: 'text', id: 'space', label: 'Space', placeholder: 'cdf_cdm' },
                { kind: 'text', id: 'externalId', label: 'External ID', placeholder: 'CogniteEvent' },
                { kind: 'text', id: 'version', label: 'Version', placeholder: 'v1' }
            ]}
        ]},
        {
            kind: 'array',
            path: 'externalModels',
            label: 'External Models',
            addLabel: 'Add external model',
            removeLabel: 'Remove external model',
            item: {
                kind: 'group',
                fields: [
                    { kind: 'text', id: 'space', label: 'Space', placeholder: 'e.g., cdf_cdm' },
                    { kind: 'arrayOfStrings', path: 'models', label: 'Models', addLabel: 'Add model', removeLabel: 'Remove model' }
                ]
            }
        },
        { kind: 'group', label: 'Observability', path: 'observability', fields: [
            { kind: 'text', id: 'owner', label: 'Owner', placeholder: 'e.g., team-data' },
            { kind: 'group', label: 'SLA', path: 'sla', fields: [
                { kind: 'number', id: 'freshnessMinutes', label: 'Freshness Minutes', placeholder: 'e.g., 60' },
                { kind: 'number', id: 'maxErrorRatePct', label: 'Max Error Rate %', placeholder: 'e.g., 1' }
            ]},
            { kind: 'group', label: 'Alerts', path: 'alerts', fields: [
                { kind: 'text', id: 'channel', label: 'Channel' },
                { kind: 'text', id: 'escalation', label: 'Escalation' }
            ]}
        ]},
        { kind: 'group', label: 'ID Macros', path: 'idMacros', fields: [
            { kind: 'checkbox', id: 'moduleIdPrefix', label: 'Prefix external IDs with moduleId', help: 'When true, emitted external IDs are prefixed with your moduleId.' },
            { kind: 'arrayOfStrings', path: 'examples', label: 'Examples', addLabel: 'Add example', removeLabel: 'Remove example' }
        ]}
    ]
};
export {};

