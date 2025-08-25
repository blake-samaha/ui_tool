import { parseYaml } from '@docs-as-code/yaml-emitter';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';

export type ToolkitScanResult = {
  environments: Array<{ name: string; cdf_project?: string }>;
  modules: string[];
};

export async function scanToolkitRepo(client: FileBridgeClient): Promise<ToolkitScanResult> {
  const result: ToolkitScanResult = { environments: [], modules: [] };
  try {
    const rootList = await client.list('.');
    const configFiles = rootList
      .filter((e) => e.type === 'file' && /^config\.[^/]+\.yaml$/.test(e.name))
      .map((e) => e.path);
    for (const p of configFiles) {
      try {
        const text = await client.read(p);
        if (!text) continue;
        const cfg = await parseYaml<any>(text);
        const env = cfg?.environment || {};
        const name = String(env?.name || '').trim();
        const project = String(env?.project || '').trim();
        if (name) result.environments.push({ name, cdf_project: project || undefined });
      } catch {}
    }
    const hasModulesDir = rootList.some((e) => e.type === 'dir' && e.name === 'modules');
    if (hasModulesDir) {
      const modulesList = await client.list('modules');
      for (const e of modulesList) {
        if (e.type === 'dir') result.modules.push(e.name);
      }
    }
  } catch {}
  return result;
}


