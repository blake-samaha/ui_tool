import { FileBridgeClient } from '@docs-as-code/file-bridge-client';

export type LocalEntityRef = { module: string; object: string };

export async function scanLocalModules(client: FileBridgeClient): Promise<string[]> {
  try {
    const items = await client.list('modules');
    return items.filter((e) => e.type === 'dir').map((e) => e.name);
  } catch (e: any) {
    console.warn('[catalog] Failed to list modules:', e?.message || e);
    return [];
  }
}

export async function scanLocalEntities(client: FileBridgeClient): Promise<LocalEntityRef[]> {
  const out: LocalEntityRef[] = [];
  const modules = await scanLocalModules(client);
  for (const m of modules) {
    try {
      const path = `modules/${m}/docs/model_design.json`;
      const text = await client.read(path);
      if (!text) continue;
      let json: any;
      try {
        json = JSON.parse(text);
      } catch (e: any) {
        console.warn(`[catalog] Failed to parse ${path}:`, e?.message || e);
        continue;
      }
      const objects = Array.isArray(json?.objects) ? json.objects : [];
      for (const o of objects) {
        if (o?.name && typeof o.name === 'string') out.push({ module: m, object: o.name });
      }
    } catch (e: any) {
      console.warn(`[catalog] Failed to read entities for module ${m}:`, e?.message || e);
      continue;
    }
  }
  return out;
}

export async function scanLocalRelationshipLabels(client: FileBridgeClient): Promise<string[]> {
  const labels = new Set<string>();
  const modules = await scanLocalModules(client);
  for (const m of modules) {
    try {
      const path = `modules/${m}/docs/model_design.json`;
      const text = await client.read(path);
      if (!text) continue;
      let json: any;
      try {
        json = JSON.parse(text);
      } catch (e: any) {
        console.warn(`[catalog] Failed to parse ${path}:`, e?.message || e);
        continue;
      }
      const relationships = Array.isArray(json?.relationships) ? json.relationships : [];
      for (const r of relationships) {
        const label = typeof r?.label === 'string' ? r.label.trim() : '';
        if (label) labels.add(label);
      }
    } catch (e: any) {
      console.warn(`[catalog] Failed to read relationships for module ${m}:`, e?.message || e);
      continue;
    }
  }
  return Array.from(labels).sort((a, b) => a.localeCompare(b));
}

export type ImplementTriple = { space: string; externalId: string; version?: string };

export async function scanLocalImplements(client: FileBridgeClient): Promise<ImplementTriple[]> {
  const triples = new Map<string, ImplementTriple>();
  const modules = await scanLocalModules(client);
  for (const m of modules) {
    try {
      const path = `modules/${m}/docs/model_design.json`;
      const text = await client.read(path);
      if (!text) continue;
      let json: any;
      try {
        json = JSON.parse(text);
      } catch (e: any) {
        console.warn(`[catalog] Failed to parse ${path}:`, e?.message || e);
        continue;
      }
      const objects = Array.isArray(json?.objects) ? json.objects : [];
      for (const o of objects) {
        const impls = Array.isArray(o?.implements) ? o.implements : [];
        for (const it of impls) {
          const space = typeof it?.space === 'string' ? it.space : '';
          const externalId = typeof it?.externalId === 'string' ? it.externalId : '';
          const version = typeof it?.version === 'string' ? it.version : undefined;
          if (!space || !externalId) continue;
          const key = `${space}:${externalId}${version ? '@' + version : ''}`;
          if (!triples.has(key)) triples.set(key, { space, externalId, version });
        }
      }
    } catch (e: any) {
      console.warn(`[catalog] Failed to read implements for module ${m}:`, e?.message || e);
      continue;
    }
  }
  return Array.from(triples.values());
}


