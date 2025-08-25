import { FileBridgeClient } from '@docs-as-code/file-bridge-client';
import { emitYaml, parseYaml } from '@docs-as-code/yaml-emitter';

function dirname(path: string): string {
  const idx = path.lastIndexOf('/');
  return idx >= 0 ? path.slice(0, idx) : '.';
}

export async function safeReadJson<T = any>(client: FileBridgeClient, path: string): Promise<T | null> {
  try {
    const text = await client.read(path);
    if (!text) return null;
    try {
      return JSON.parse(text) as T;
    } catch (e: any) {
      console.warn('[io] Failed to parse JSON:', path, e?.message || e);
      return null;
    }
  } catch (e: any) {
    console.warn('[io] Failed to read:', path, e?.message || e);
    return null;
  }
}

export async function writeJson(client: FileBridgeClient, path: string, data: unknown): Promise<void> {
  const dir = dirname(path);
  if (dir && dir !== '.') await client.mkdirp(dir);
  await client.write(path, JSON.stringify(data, null, 2) + '\n');
}

export async function readYamlFile<T = any>(client: FileBridgeClient, path: string): Promise<T | null> {
  try {
    const text = await client.read(path);
    if (!text) return null;
    return (await parseYaml<T>(text)) as T;
  } catch (e: any) {
    console.warn('[io] Failed to read/parse YAML:', path, e?.message || e);
    return null;
  }
}

export async function writeYamlFile(client: FileBridgeClient, path: string, data: unknown): Promise<void> {
  const dir = dirname(path);
  if (dir && dir !== '.') await client.mkdirp(dir);
  const yaml = await emitYaml(data, { indent: 2 });
  await client.write(path, yaml);
}


