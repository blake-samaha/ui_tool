import type { UISchema } from '@docs-as-code/form-renderer';

export type ValidationResult = 
  | { status: 'valid' }
  | { status: 'warning'; message: string; details?: string[] }
  | { status: 'error'; message: string; details?: string[] };

export type WizardStep = {
  id: string;
  title: string;
  uiSchema: UISchema;
  validate?: (data: any) => ValidationResult;
  help?: string;
};

export type TierLinkage = {
  parentTier00?: { uiStatePath: string; yamlPath: string };
  parentTier01?: { moduleId: string; uiStatePath: string; yamlPath: string };
};


