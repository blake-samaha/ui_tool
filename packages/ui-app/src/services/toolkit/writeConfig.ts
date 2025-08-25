import { writeYamlFile } from '../io.js';
import { validateConfigObject } from './validateConfig.js';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';

export async function writeConfigFiles(client: FileBridgeClient, configs: Record<string, any>): Promise<{ written: string[]; errors: Array<{ env: string; errors: string[] }> }> {
  const written: string[] = [];
  const failures: Array<{ env: string; errors: string[] }> = [];
  for (const [envName, cfg] of Object.entries(configs)) {
    const errs = validateConfigObject(cfg);
    if (errs.length > 0) {
      failures.push({ env: envName, errors: errs });
      continue;
    }
    const file = `config.${envName}.yaml`;
    await writeYamlFile(client, file, cfg);
    written.push(file);
  }
  return { written, errors: failures };
}


