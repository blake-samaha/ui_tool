import type { WizardStep } from '../../components/wizard/types.js';
import type { UISchema } from '@docs-as-code/form-renderer';

const step = (id: string, title: string, uiSchema: UISchema, help?: string): WizardStep => ({ id, title, uiSchema, help });

export const tier00Steps: WizardStep[] = [
  step('project-overview', 'Project Overview', {
    fields: [
      { kind: 'text', id: 'moduleId', label: 'Module ID', placeholder: 'e.g., well_performance', help: 'Snake_case identifier for the module. Used as a prefix in external IDs. Pattern: ^[a-z0-9]+(?:_[a-z0-9]+)*$' },
      { kind: 'text', id: 'projectId', label: 'Project ID', placeholder: 'e.g., acme_upstream_2025', help: 'Optional human/project identifier for documentation.' }
    ]
  }),
  step('environments', 'Environments', {
    fields: [
      { kind: 'array', path: 'environments', label: 'Environments', addLabel: 'Add', removeLabel: 'Remove', item: { kind: 'group', fields: [
        { kind: 'text', id: 'name', label: 'Name', placeholder: 'dev, prod', help: 'Environment name (e.g., dev, prod).' },
        { kind: 'text', id: 'cdf_cluster', label: 'cdf_cluster', placeholder: 'e.g., westeurope-1' },
        { kind: 'text', id: 'cdf_region', label: 'cdf_region', placeholder: 'e.g., eu-west-1' },
        { kind: 'text', id: 'idp_tenant_id', label: 'idp_tenant_id', placeholder: 'UUID', help: 'Identity provider tenant ID (UUID).' },
        { kind: 'text', id: 'admin_group_source_id', label: 'admin_group_source_id', placeholder: 'UUID', help: 'IdP group source ID for admin role.' },
        { kind: 'text', id: 'user_group_source_id', label: 'user_group_source_id', placeholder: 'UUID', help: 'IdP group source ID for user role.' }
      ]}}
    ]
  }),
  step('space', 'Space', { fields: [ { kind: 'group', path: 'space', fields: [ { kind: 'text', id: 'externalId', label: 'Space External ID', placeholder: 'e.g., sp_my_project_space', help: 'External ID of the target DM space. Pattern: ^[a-z0-9_\\-:.]+$' }, { kind: 'text', id: 'description', label: 'Description', placeholder: 'Short description of the space' } ] } ] }),
  step('raw-sources', 'RAW Sources', { fields: [ { kind: 'array', path: 'rawSources', label: 'Sources', addLabel: 'Add', removeLabel: 'Remove', item: { kind: 'group', fields: [ { kind: 'text', id: 'sourceSystem', label: 'Source System', placeholder: 'e.g., SAP S/4HANA' }, { kind: 'text', id: 'database', label: 'RAW Database', placeholder: 'e.g., raw_sap_s4hana' }, { kind: 'arrayOfStrings', path: 'tables', label: 'Tables', addLabel: 'Add', removeLabel: 'Remove' }, { kind: 'textarea', id: 'description', label: 'Description', placeholder: 'What data these tables contain' } ] } } ] }),
  step('toolkit', 'Toolkit', { fields: [ { kind: 'group', path: 'toolkit', fields: [ { kind: 'select', id: 'deployStrategy', label: 'Deploy Strategy', help: 'Toolkit apply strategy. upsert merges changes; replace overwrites.', options: [ { value: '', label: '' }, { value: 'upsert', label: 'upsert' }, { value: 'replace', label: 'replace' } ] }, { kind: 'checkbox', id: 'dryRun', label: 'Dry Run', help: 'If true, Toolkit performs a dry run without applying changes.' }, { kind: 'group', path: 'retries', fields: [ { kind: 'number', id: 'maxAttempts', label: 'Max Attempts', placeholder: 'e.g., 6' }, { kind: 'select', id: 'backoff', label: 'Backoff', options: [ { value: '', label: '' }, { value: 'exponential', label: 'exponential' }, { value: 'linear', label: 'linear' }, { value: 'fixed', label: 'fixed' } ] }, { kind: 'number', id: 'maxBackoffSeconds', label: 'Max Backoff Seconds', placeholder: 'e.g., 64' } ] } ] } ] }),
  step('promotion', 'Promotion', { fields: [ { kind: 'group', path: 'promotion', fields: [ { kind: 'text', id: 'fromEnv', label: 'From Env', placeholder: 'e.g., dev' }, { kind: 'text', id: 'toEnv', label: 'To Env', placeholder: 'e.g., prod' }, { kind: 'arrayOfStrings', path: 'guardrails', label: 'Guardrails', addLabel: 'Add', removeLabel: 'Remove' } ] } ] }),
  step('access-roles', 'Access Roles', { fields: [ { kind: 'array', path: 'accessRoles', label: 'Roles', addLabel: 'Add', removeLabel: 'Remove', item: { kind: 'group', fields: [ { kind: 'text', id: 'name', label: 'Name', placeholder: 'e.g., Data Administrator' }, { kind: 'text', id: 'sourceIdVariable', label: 'Source ID Variable', placeholder: '{{ admin_group_source_id }}' }, { kind: 'textarea', id: 'permissionsSummary', label: 'Permissions', placeholder: 'High-level permission summary' }, { kind: 'arrayOfStrings', path: 'capabilities', label: 'Capabilities', addLabel: 'Add', removeLabel: 'Remove' } ] } } ] }),
  step('global-standards', 'Global Standards', { fields: [ { kind: 'group', path: 'globalStandards', fields: [ { kind: 'text', id: 'globalNamingConvention', label: 'Naming Convention', placeholder: 'e.g., prefix:scope:name' }, { kind: 'text', id: 'timestampStandard', label: 'Timestamp Standard', placeholder: 'e.g., ISO 8601 UTC' }, { kind: 'text', id: 'requiredPropertyForAllObjects', label: 'Required Property', placeholder: 'e.g., source_last_updated_time' } ] } ] }),
  step('core-model', 'Core Model Inheritance', { fields: [ { kind: 'group', path: 'coreModelInheritance', fields: [ { kind: 'group', path: 'assetView', fields: [ { kind: 'text', id: 'space', label: 'Space', placeholder: 'cdf_cdm' }, { kind: 'text', id: 'externalId', label: 'External ID', placeholder: 'CogniteAsset' }, { kind: 'text', id: 'version', label: 'Version', placeholder: 'v1' } ] }, { kind: 'group', path: 'eventView', fields: [ { kind: 'text', id: 'space', label: 'Space', placeholder: 'cdf_cdm' }, { kind: 'text', id: 'externalId', label: 'External ID', placeholder: 'CogniteEvent' }, { kind: 'text', id: 'version', label: 'Version', placeholder: 'v1' } ] } ] } ] }),
  step('external-models', 'External Models', { fields: [ { kind: 'array', path: 'externalModels', label: 'Models', addLabel: 'Add', removeLabel: 'Remove', item: { kind: 'group', fields: [ { kind: 'text', id: 'space', label: 'Space', placeholder: 'e.g., cdf_cdm' }, { kind: 'arrayOfStrings', path: 'models', label: 'Models', addLabel: 'Add', removeLabel: 'Remove' } ] } } ] }),
  step('observability', 'Observability', { fields: [ { kind: 'group', path: 'observability', fields: [ { kind: 'text', id: 'owner', label: 'Owner', placeholder: 'e.g., team-data' }, { kind: 'group', path: 'sla', fields: [ { kind: 'number', id: 'freshnessMinutes', label: 'Freshness Minutes', placeholder: 'e.g., 60' }, { kind: 'number', id: 'maxErrorRatePct', label: 'Max Error Rate %', placeholder: 'e.g., 1' } ] }, { kind: 'group', path: 'alerts', fields: [ { kind: 'text', id: 'channel', label: 'Channel' }, { kind: 'text', id: 'escalation', label: 'Escalation' } ] } ] } ] }),
  step('id-macros', 'ID Macros', { fields: [ { kind: 'group', path: 'idMacros', fields: [ { kind: 'checkbox', id: 'moduleIdPrefix', label: 'Prefix external IDs with moduleId', help: 'When true, emitted external IDs are prefixed with your moduleId.' }, { kind: 'arrayOfStrings', path: 'examples', label: 'Examples', addLabel: 'Add', removeLabel: 'Remove' } ] } ] })
];


