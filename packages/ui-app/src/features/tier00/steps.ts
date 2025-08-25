import type { WizardStep, ValidationResult } from '../../components/wizard/types.js';
import type { UISchema } from '@docs-as-code/form-renderer';

const step = (id: string, title: string, uiSchema: UISchema, help?: string, validate?: WizardStep['validate']): WizardStep => ({ id, title, uiSchema, help, validate });

// Validation functions for comprehensive step validation
const validateRepository = (data: any): ValidationResult => {
  if (!data?.repositoryRoot || String(data.repositoryRoot).trim().length === 0) {
    return { status: 'error', message: 'Repository root is required to continue.' };
  }
  return { status: 'valid' };
};


const validateEnvironments = (data: any): ValidationResult => {
  const rawEnvs = Array.isArray(data?.environments) ? data.environments : [];
  // Ignore completely blank stubs (no name and no cdf_project)
  const environments = rawEnvs.filter((env: any) => {
    const name = String(env?.name ?? '').trim();
    const project = String(env?.cdf_project ?? '').trim();
    const cluster = String(env?.cdf_cluster ?? '').trim();
    return name.length > 0 || project.length > 0 || cluster.length > 0;
  });
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (environments.length === 0) {
    return { status: 'error', message: 'At least one environment is required', details: ['Add a dev or prod environment'] };
  }
  
  const envNames = new Set<string>();
  environments.forEach((env: any, index: number) => {
    if (!env?.name || String(env.name).trim().length === 0) {
      errors.push(`Environment ${index + 1}: Name is required`);
    } else {
      const name = String(env.name).trim().toLowerCase();
      if (envNames.has(name)) {
        errors.push(`Environment ${index + 1}: Duplicate name "${env.name}"`);
      }
      envNames.add(name);
    }
    
    if (!env?.cdf_project || String(env.cdf_project).trim().length === 0) {
      errors.push(`Environment ${index + 1}: CDF Project is required`);
    }
    
    if (!env?.idp_tenant_id || String(env.idp_tenant_id).trim().length === 0) {
      warnings.push(`Environment ${index + 1}: IdP Tenant ID is recommended for authentication`);
    }
    
    if (!env?.admin_group_source_id || String(env.admin_group_source_id).trim().length === 0) {
      warnings.push(`Environment ${index + 1}: Admin Group Source ID is recommended`);
    }
  });
  
  // Check for common environment patterns
  const hasDevLike = environments.some((env: any) => 
    String(env.name || '').toLowerCase().includes('dev')
  );
  const hasProdLike = environments.some((env: any) => 
    String(env.name || '').toLowerCase().includes('prod')
  );
  
  if (!hasDevLike && !hasProdLike) {
    warnings.push('Consider adding both dev and prod environments');
  }
  
  if (errors.length > 0) {
    return { status: 'error', message: 'Environment validation failed', details: errors };
  }
  
  if (warnings.length > 0) {
    return { status: 'warning', message: 'Environments could be more complete', details: warnings };
  }
  
  return { status: 'valid' };
};

export const tier00Steps: WizardStep[] = [
  // Step 1: repository selection
  step(
    'repo-setup',
    'Repository',
    {
      fields: [
        { kind: 'directory', id: 'repositoryRoot', label: 'Repository root', placeholder: '/abs/path/to/repository', help: 'Pick a local repository using the project selector in the header (Browse…), or paste the absolute path here.' },
        { kind: 'select', id: 'repositoryHost', label: 'Repository Host', options: [
          { value: 'GitHub', label: 'GitHub' },
          { value: 'Azure DevOps', label: 'Azure DevOps' },
          { value: 'None', label: 'None' },
          { value: 'Other', label: 'Other' }
        ], help: 'Used to pass --host to `cdf repo init` and avoid interactive prompts.' }
      ]
    },
    'Select a local repository to work in. The app will create missing folders under project_templates when you continue.',
    validateRepository
  ),
  // Step 2: define modules
  step(
    'modules',
    'Modules',
    {
      fields: [
        {
          kind: 'array',
          path: 'modules',
          label: 'Modules',
          addLabel: 'Add Module',
          removeLabel: 'Remove',
          collapsible: true,
          titleField: 'name',
          showIndex: true,
          item: {
            kind: 'group',
            fields: [
              { kind: 'text', id: 'name', label: 'Module Name', placeholder: 'e.g., my_data_model_module', help: 'Lowercase with underscores recommended.' },
              { kind: 'textarea', id: 'description', label: 'Description (optional)', placeholder: 'Short purpose of this module' },
              { kind: 'arrayOfStrings', path: 'tags', label: 'Tags (optional)', addLabel: 'Add tag', removeLabel: 'Remove', help: 'Module categorization tags used in module.toml. Examples: custom, ingestion, datamodel, app_support' }
            ]
          }
        }
      ]
    },
    'Create one or more Toolkit modules. On Finish, the app will run cdf modules add <name> and scaffold standard directories.',
    undefined
  ),
  step('environments', 'Environments', {
    fields: [
      { 
        kind: 'array', 
        path: 'environments', 
        label: 'Environments', 
        addLabel: 'Add Environment', 
        removeLabel: 'Remove', 
        collapsible: true,
        titleField: 'name',
        showIndex: true,
        newItemPrefill: [
          { id: 'cdf_cluster', fromPath: '$.cdf_cluster' },
          { id: 'cdf_project', fromPath: '$.projectId' }
        ], 
        item: { kind: 'group', fields: [
        { kind: 'text', id: 'name', label: 'Name', placeholder: 'dev, prod', help: 'Environment name (e.g., dev, prod).' },
        { kind: 'text', id: 'cdf_project', label: 'CDF Project', placeholder: 'e.g., my_cdf_project', help: 'CDF project name/ID used by Toolkit and SDK.', prefillFromPath: '$.projectId', suggestFrom: [ { path: '$.projectId', label: 'Project ID' } ] },
        { kind: 'text', id: 'cdf_cluster', label: 'CDF Cluster', placeholder: 'e.g., westeurope-1', help: 'Default CDF cluster for this project. Each environment can override this.', prefillFromPath: '$.cdf_cluster', suggestFrom: [ { path: '$.cdf_cluster', label: 'Project default cluster' } ] },
        { kind: 'text', id: 'cdf_region', label: 'CDF Region (Optional)', placeholder: 'e.g., eu-west-1', help: 'Optional hint for documentation/templates. SDK/Toolkit generally derive endpoints from cluster (e.g., westeurope-1) and project.' },
        { kind: 'text', id: 'idp_tenant_id', label: 'IdP Tenant ID', placeholder: 'UUID', help: 'Azure Entra ID Tenant (Directory) ID (GUID). Azure Portal → Microsoft Entra ID → Overview → Tenant ID.' },
        { kind: 'text', id: 'admin_group_source_id', label: 'Admin Group Source ID', placeholder: 'Azure AD group Object ID', help: 'Azure Entra ID group Object ID for your CDF Admins. Entra admin center → Groups → your group → Overview → Object ID. Used by Docs Admin and Toolkit to map IdP group to CDF Admin role. Recommended to provide this; the user group can be optional.' },
        { kind: 'text', id: 'user_group_source_id', label: 'User Group Source ID', placeholder: 'Azure AD group Object ID', help: 'Azure Entra ID group Object ID for readers/users. Used to seed reader access and examples in Docs/Toolkit. Optional if you manage permissions elsewhere.' },
        { kind: 'group', label: 'Authentication', path: 'authentication', fields: [
          { kind: 'select', id: 'method', label: 'Method', help: 'How the UI/Toolkit authenticates to CDF for this environment. Secrets are not collected by the UI; use ${ENV:VAR} placeholders in files and set them in your environment.', options: [
            { value: '', label: '' },
            { value: 'client_credentials', label: 'Client credentials' },
            { value: 'device_code', label: 'Device code (interactive)' },
            { value: 'pkce', label: 'PKCE (public client)' },
            { value: 'token', label: 'Bearer token (testing only)' }
          ]},
          { kind: 'text', id: 'authority', label: 'Authority', placeholder: 'https://login.microsoftonline.com/{tenantId}', help: 'Microsoft Entra ID issuer (authority). Use https://login.microsoftonline.com/{tenantId}. Prefer authority over hardcoding tokenUrl.' },
          { kind: 'text', id: 'tokenUrl', label: 'Token URL', placeholder: 'https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token', help: 'Direct v2.0 token endpoint. Optional when authority is set.' },
          { kind: 'text', id: 'audience', label: 'Audience', placeholder: 'cognite', help: 'Audience/resource (rarely used with Entra ID; scopes are preferred).' },
          { kind: 'text', id: 'clientId', label: 'Client ID', help: 'Microsoft Entra ID "Application (client) ID" from App registrations. For security, actual value will be referenced from environment variables.', readonly: true, secretPlaceholder: '${CLIENT_ID}', visibleWhen: { path: 'method', in: ['client_credentials', 'pkce'] } },
          { kind: 'text', id: 'clientSecret', label: 'Client Secret', help: 'Microsoft Entra ID application client secret. For security, actual value will be referenced from environment variables.', readonly: true, secretPlaceholder: '${CLIENT_SECRET}', visibleWhen: { path: 'method', equals: 'client_credentials' } },
          { kind: 'text', id: 'certificateThumbprint', label: 'Certificate Thumbprint', help: 'Certificate thumbprint for certificate-credential flows. Actual value will be referenced from environment variables.', readonly: true, secretPlaceholder: '${CERTIFICATE_THUMBPRINT}', visibleWhen: { path: 'method', equals: 'client_credentials' } },
          { kind: 'arrayOfStrings', path: 'scopes', label: 'Scopes', addLabel: 'Add Scope', removeLabel: 'Remove Scope', visibleWhen: [ { path: 'method', in: ['device_code', 'pkce'] } ] },
          { kind: 'text', id: 'redirectUri', label: 'Redirect URI', help: 'PKCE only: redirect URI registered for the public client.', visibleWhen: { path: 'method', equals: 'pkce' } },
          { kind: 'text', id: 'token', label: 'Bearer Token', help: 'Pre-issued bearer token for testing only. For security, actual token will be referenced from environment variables.', readonly: true, secretPlaceholder: '${BEARER_TOKEN}', visibleWhen: { path: 'method', equals: 'token' } }
        ]}
      ]}}
    ]
  }, undefined, validateEnvironments),
  // Step 4: assign modules per environment
  step(
    'env-config',
    'Environment Configuration',
    {
      fields: [
        {
          kind: 'array',
          path: 'environments',
          label: 'Per-environment settings',
          addLabel: 'Add',
          removeLabel: 'Remove',
          collapsible: true,
          titleField: 'name',
          showIndex: true,
          item: {
            kind: 'group',
            fields: [
              { kind: 'text', id: 'name', label: 'Name', placeholder: 'dev' },
              { kind: 'multiselect', id: 'selectedModules', label: 'Active Modules', optionsFromPath: '$.modules', help: 'Select modules active in this environment.' }
            ]
          }
        }
      ]
    },
    'Select which modules are active per environment. The selection will be written under environment.selected in config.[env].yaml.',
    undefined
  ),
  
  // toolkit and promotion steps intentionally removed; deprecated content hidden per migration
  step('global-standards', 'Global Standards', { fields: [ { kind: 'group', path: 'globalStandards', fields: [ 
    { kind: 'select', id: 'timestampStandard', label: 'Timestamp Standard', 
      options: [
        { value: 'ISO_8601_UTC', label: 'ISO 8601 (UTC, Z)' },
        { value: 'RFC_3339', label: 'RFC 3339' },
        { value: 'UNIX_EPOCH_MS', label: 'Unix epoch (milliseconds)' },
        { value: 'UNIX_EPOCH_S', label: 'Unix epoch (seconds)' }
      ],
      help: 'Preferred timestamp representation across emitted YAML and examples. ISO 8601 (UTC) is recommended for human-readable timestamps; epoch is common in programmatic contexts.'
    },
    { kind: 'group', label: 'Naming', path: 'naming', fields: [
      { kind: 'select', id: 'caseStyle', label: 'Case Style', help: 'Controls casing for generated IDs and names where applicable.', options: [
        { value: 'snake', label: 'snake_case' },
        { value: 'kebab', label: 'kebab-case' },
        { value: 'pascal', label: 'PascalCase' }
      ]},
      { kind: 'select', id: 'idSeparator', label: 'ID Separator', options: [
        { value: '_', label: 'underscore (_)' },
        { value: '-', label: 'hyphen (-)' }
      ], help: 'Separator for external IDs.'},
      { kind: 'select', id: 'nameSeparator', label: 'Name Separator', options: [
        { value: ':', label: 'colon (:)' },
        { value: '-', label: 'hyphen (-)' },
        { value: '_', label: 'underscore (_)' },
        { value: '/', label: 'slash (/)' }
      ], help: 'Separator for display names.'},
      { kind: 'group', label: 'Prefixes', path: 'prefixes', fields: [
        { kind: 'text', id: 'extractionPipeline', label: 'Extraction Pipeline Prefix', placeholder: 'ep', help: 'External ID prefix for extraction pipelines (e.g., ep).'},
        { kind: 'text', id: 'transformation', label: 'Transformation Prefix', placeholder: 'tr', help: 'External ID prefix for transformations (e.g., tr).'},
        { kind: 'text', id: 'function', label: 'Function Prefix', placeholder: 'fn', help: 'External ID prefix for functions (e.g., fn).'},
        { kind: 'text', id: 'authGroup', label: 'Authorization Group Prefix', placeholder: 'gp', help: 'Name prefix for authorization groups (e.g., gp).'},
        { kind: 'text', id: 'securityCategory', label: 'Security Category Prefix', placeholder: 'sc', help: 'Name prefix for security categories (e.g., sc).'},
        { kind: 'text', id: 'space', label: 'Data Model Space Prefix', placeholder: 'sp', help: 'Prefix for data model spaces (e.g., sp).'}
      ]}
    ]},
    { kind: 'checkbox', id: 'prefixExternalIdsWithModuleId', label: 'Prefix external IDs with moduleId', help: 'When enabled, generated externalIds in Toolkit YAML will be prefixed with your moduleId (for example, tr_my_module_asset_hierarchy). This improves uniqueness and idempotent deploys across modules and follows the Toolkit guidance to use consistent, descriptive externalIds. See Cognite Toolkit YAML/Deploy docs for directory and naming standards.' }
  ] } ] }),
  
  
  
];


