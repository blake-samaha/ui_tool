import type { UISchema } from '@docs-as-code/form-renderer';

export const Tier00UISchema: UISchema = {
    fields: [
        { kind: 'text', id: 'moduleId', label: 'Module ID',
          placeholder: 'e.g., well_performance',
          help: 'Snake_case identifier for the module. Used as a prefix in external IDs. Pattern: ^[a-z0-9]+(?:_[a-z0-9]+)*$ (see requirements 10.1 and 01/XX schemas).'},
        { kind: 'text', id: 'projectId', label: 'Project ID',
          placeholder: 'e.g., acme_upstream_2025',
          help: 'Optional human/project identifier for documentation. Not used by Toolkit directly.' },
        
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
                    { kind: 'text', id: 'idp_tenant_id', label: 'idp_tenant_id', placeholder: 'UUID', help: 'Azure Entra ID Tenant (Directory) ID (GUID). Entra admin center → Overview → Tenant ID.'},
                    { kind: 'text', id: 'admin_group_source_id', label: 'admin_group_source_id', placeholder: 'Azure AD group Object ID', help: 'Azure Entra ID group Object ID for your CDF Admins. Groups → your group → Overview → Object ID.' },
                    { kind: 'text', id: 'user_group_source_id', label: 'user_group_source_id', placeholder: 'Azure AD group Object ID', help: 'Azure Entra ID group Object ID for readers/users.' }
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
            { kind: 'select', id: 'deployStrategy', label: 'Deploy Strategy', help: 'Toolkit apply strategy. upsert merges changes; replace overwrites existing resources. See Toolkit Deploy docs.', options: [
                { value: '', label: '' },
                { value: 'upsert', label: 'upsert' },
                { value: 'replace', label: 'replace' }
            ]},
            { kind: 'checkbox', id: 'dryRun', label: 'Dry Run', help: 'If true, Toolkit performs a dry run without applying changes. Use to inspect planned operations safely.' },
            { kind: 'group', label: 'Retries', path: 'retries', fields: [
                { kind: 'number', id: 'maxAttempts', label: 'Max Attempts', placeholder: 'e.g., 6', help: 'Total number of retry attempts for transient failures.' },
                { kind: 'select', id: 'backoff', label: 'Backoff', options: [
                    { value: '', label: '' },
                    { value: 'exponential', label: 'exponential' },
                    { value: 'linear', label: 'linear' },
                    { value: 'fixed', label: 'fixed' }
                ], help: 'Retry backoff strategy for failed operations.'},
                { kind: 'number', id: 'maxBackoffSeconds', label: 'Max Backoff Seconds', placeholder: 'e.g., 64', help: 'Upper bound for backoff delay between retries.' }
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
            { kind: 'select', id: 'timestampStandard', label: 'Timestamp Standard', options: [
                { value: 'ISO_8601_UTC', label: 'ISO 8601 (UTC, Z)' },
                { value: 'RFC_3339', label: 'RFC 3339' },
                { value: 'UNIX_EPOCH_MS', label: 'Unix epoch (milliseconds)' },
                { value: 'UNIX_EPOCH_S', label: 'Unix epoch (seconds)' }
            ], help: 'Preferred timestamp representation across emitted YAML and examples. ISO 8601 (UTC) recommended.' },
            { kind: 'group', label: 'Naming', path: 'naming', fields: [
                { kind: 'select', id: 'caseStyle', label: 'Case Style', options: [
                    { value: 'snake', label: 'snake_case' },
                    { value: 'kebab', label: 'kebab-case' },
                    { value: 'pascal', label: 'PascalCase' }
                ]},
                { kind: 'select', id: 'idSeparator', label: 'ID Separator', options: [
                    { value: '_', label: 'underscore (_)' },
                    { value: '-', label: 'hyphen (-)' }
                ]},
                { kind: 'select', id: 'nameSeparator', label: 'Name Separator', options: [
                    { value: ':', label: 'colon (:)' },
                    { value: '-', label: 'hyphen (-)' },
                    { value: '_', label: 'underscore (_)' },
                    { value: '/', label: 'slash (/)' }
                ]},
                { kind: 'group', label: 'Prefixes', path: 'prefixes', fields: [
                    { kind: 'text', id: 'extractionPipeline', label: 'Extraction Pipeline Prefix', placeholder: 'ep' },
                    { kind: 'text', id: 'transformation', label: 'Transformation Prefix', placeholder: 'tr' },
                    { kind: 'text', id: 'function', label: 'Function Prefix', placeholder: 'fn' },
                    { kind: 'text', id: 'authGroup', label: 'Authorization Group Prefix', placeholder: 'gp' },
                    { kind: 'text', id: 'securityCategory', label: 'Security Category Prefix', placeholder: 'sc' },
                    { kind: 'text', id: 'space', label: 'Data Model Space Prefix', placeholder: 'sp' }
                ]}
            ]}
        ]},
        { kind: 'checkbox', id: 'prefixExternalIdsWithModuleId', label: 'Prefix external IDs with moduleId', help: 'When enabled, generated externalIds in Toolkit YAML will be prefixed with your moduleId (e.g., tr_my_module_asset_hierarchy) to ensure uniqueness and stable deploys. See Toolkit Deploy/YAML reference for naming guidance.' },
        
    ]
};
export {};

