import { emitYaml } from '@docs-as-code/yaml-emitter';

export async function emitTierXXYaml(data: any): Promise<string> {
  return emitYaml(data, { indent: 2 });
}


