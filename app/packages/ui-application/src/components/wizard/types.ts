import type { UISchema } from '@docs-as-code/form-renderer';

export type WizardStep = {
  id: string;
  title: string;
  uiSchema: UISchema;
  validate?: (data: any) => { ok: true } | { ok: false; message: string };
  help?: string;
};

export type TierLinkage = {
  parentTier00?: { uiStatePath: string; yamlPath: string };
  parentTier01?: { moduleId: string; uiStatePath: string; yamlPath: string };
};


