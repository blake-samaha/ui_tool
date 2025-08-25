import { emitYaml } from '@docs-as-code/yaml-emitter';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';
import { ModelDesignZ, type ModelDesign, ModelOverviewZ } from '@docs-as-code/shared-types/dist/schemas/index.js';
import { generateModelingContextMarkdownFromParts, writeMarkdown } from '../../../services/markdown.js';
import { safeReadJson, writeJson, readYamlFile, writeYamlFile } from '../../../services/io.js';

export async function emitTier01Yaml(data: any): Promise<string> {
  return emitYaml(data, { indent: 2 });
}

export function createModelDesignSkeleton(moduleName: string): ModelDesign {
  return {
    specVersion: 'phase2-1',
    module: moduleName,
    modelVersion: '1',
    purpose: { overview: '' },
    personas: [],
    problems: [],
    objects: [],
    relationships: [],
    entities: []
  };
}

export async function readModelDesign(client: FileBridgeClient, moduleName: string): Promise<ModelDesign | null> {
  const path = `modules/${moduleName}/docs/model_design.json`;
  const json = await safeReadJson<any>(client, path);
  if (!json) return null;
  const parsed = ModelDesignZ.safeParse(json);
  if (!parsed.success) {
    console.warn(`[modelDesign] Validation failed at ${path}:`, parsed.error.format());
    return json as ModelDesign;
  }
  return parsed.data;
}

export async function writeModelDesign(client: FileBridgeClient, moduleName: string, design: unknown): Promise<ModelDesign> {
  try {
    const parsed = ModelDesignZ.parse(design);
    await writeJson(client, `modules/${moduleName}/docs/model_design.json`, parsed);
    return parsed;
  } catch (e: any) {
    console.error('[modelDesign] Failed to write model_design.json:', e?.message || e);
    throw e;
  }
}

export async function writeModelOverview(client: FileBridgeClient, moduleName: string, design: ModelDesign): Promise<void> {
  const overview = {
    specVersion: design.specVersion,
    module: design.module,
    modelVersion: design.modelVersion,
    purpose: design.purpose,
    personas: design.personas,
    problems: design.problems,
    objects: design.objects,
    relationships: design.relationships
  } as any;
  const parsed = ModelOverviewZ.parse(overview);
  await writeJson(client, `modules/${moduleName}/docs/model_overview.json`, parsed);
}

export function validateModelDesignPartial(pick: (shape: any) => any, data: unknown): { ok: boolean; issues?: string[] } {
  try {
    const sub = pick((ModelDesignZ as any).shape);
    const res = sub.safeParse(data);
    if (res.success) return { ok: true };
    return { ok: false, issues: res.error.issues.map((i: any) => `${i.path.join('.')}: ${i.message}`) };
  } catch (e: any) {
    return { ok: false, issues: [String(e?.message || e)] };
  }
}

export function generateModelingContextMarkdown(design: ModelDesign): string {
  return generateModelingContextMarkdownFromParts({
    module: design.module,
    purpose: design.purpose,
    personas: design.personas,
    problems: design.problems,
    objects: design.objects,
    relationships: design.relationships
  });
}

export async function writeModelingContextMarkdown(client: FileBridgeClient, moduleName: string, markdown: string): Promise<void> {
  try {
    await writeMarkdown(client, moduleName, 'modeling_context.md', markdown);
  } catch (e: any) {
    console.warn('[modelDesign] Failed to write modeling_context.md:', e?.message || e);
  }
}

export async function addModuleToEnvironments(client: FileBridgeClient, moduleName: string, environments: string[]): Promise<{ updated: string[]; failed: Array<{ env: string; error: string }> }> {
  const updated: string[] = [];
  const failed: Array<{ env: string; error: string }> = [];
  for (const env of environments) {
    try {
      const path = `config.${env}.yaml`;
      const cfg = await readYamlFile<any>(client, path);
      if (!cfg) continue;
      const envObj = cfg.environment || (cfg.environment = {});
      const selected: string[] = Array.isArray(envObj.selected) ? envObj.selected : [];
      if (!selected.includes(moduleName)) selected.push(moduleName);
      envObj.selected = selected;
      await writeYamlFile(client, path, cfg);
      updated.push(env);
    } catch (e: any) {
      console.warn('[env] Failed to update environment config:', env, e?.message || e);
      failed.push({ env, error: String(e?.message || e) });
    }
  }
  return { updated, failed };
}

export async function assignDataModelToEnvironments(
  client: FileBridgeClient,
  params: { externalId: string; space: string; version?: string },
  environments: string[]
): Promise<{ updated: string[]; failed: Array<{ env: string; error: string }> }> {
  const updated: string[] = [];
  const failed: Array<{ env: string; error: string }> = [];
  const ext = String(params?.externalId || '').trim();
  const sp = String(params?.space || '').trim();
  const ver = params?.version ? String(params.version).trim() : undefined;
  if (!ext || !sp) return { updated, failed };
  for (const env of environments) {
    try {
      const path = `config.${env}.yaml`;
      const cfg = await readYamlFile<any>(client, path);
      if (!cfg) continue;
      const vars = (cfg.variables = cfg.variables && typeof cfg.variables === 'object' && !Array.isArray(cfg.variables) ? cfg.variables : {});
      const schemaSpaces = Array.isArray(vars.schemaSpaces) ? vars.schemaSpaces as Array<{ name: string; space: string }> : [];
      const name = ext;
      const existingIdx = schemaSpaces.findIndex((s) => s && s.name === name);
      const entry = { name, space: sp } as { name: string; space: string };
      if (existingIdx >= 0) schemaSpaces[existingIdx] = entry; else schemaSpaces.push(entry);
      vars.schemaSpaces = schemaSpaces;
      // Optionally expose model version & id variables for downstream YAML templating
      if (ver) vars.modelVersion = ver;
      vars.modelExternalId = name;
      vars.modelSpace = sp;
      await writeYamlFile(client, path, cfg);
      updated.push(env);
    } catch (e: any) {
      console.warn('[env] Failed to assign data model to environment config:', env, e?.message || e);
      failed.push({ env, error: String(e?.message || e) });
    }
  }
  return { updated, failed };
}


