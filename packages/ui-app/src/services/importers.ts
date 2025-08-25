import { parseYaml } from '@docs-as-code/yaml-emitter';
import { Tier00SolutionDesignZ, Tier01ConceptualModelZ, TierXXObjectSpecificationZ } from '@docs-as-code/shared-types/dist/schemas/index.js';
import { canonicalizeTier00 } from './tier00.js';

export async function importTier00FromYaml(yamlText: string): Promise<any> {
  const parsed = await parseYaml<any>(yamlText);
  const result = Tier00SolutionDesignZ.partial().safeParse(parsed);
  const data = result.success ? result.data : parsed;
  return canonicalizeTier00(data);
}

export async function importTier01FromYaml(yamlText: string): Promise<any> {
  const parsed = await parseYaml<any>(yamlText);
  const result = Tier01ConceptualModelZ.partial().safeParse(parsed);
  return result.success ? result.data : parsed;
}

export async function importTierXXFromYaml(yamlText: string): Promise<any> {
  const parsed = await parseYaml<any>(yamlText);
  const result = TierXXObjectSpecificationZ.partial().safeParse(parsed);
  return result.success ? result.data : parsed;
}


