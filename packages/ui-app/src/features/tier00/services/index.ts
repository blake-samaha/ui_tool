import { emitYaml } from '@docs-as-code/yaml-emitter';

export type Tier00Paths = { yaml: string; uiState: string };
export function normalizeKeyQuestions(input: any): any {
  const clone = JSON.parse(JSON.stringify(input || {}));
  const useCases: Array<any> = Array.isArray(clone?.businessContext?.useCases) ? clone.businessContext.useCases : [];
  const existingTop: Array<any> = Array.isArray(clone?.keyQuestions) ? clone.keyQuestions : [];
  const personaGroups: Array<any> = Array.isArray(clone?.personaKeyQuestions) ? clone.personaKeyQuestions : [];
  const accumulated: Array<{ question: string; rationale?: string; personas?: string[]; useCases?: string[] }> = [];
  const seen = new Set<string>();
  function pushUnique(q: { question: string; rationale?: string; personas?: string[]; useCases?: string[] }) {
    const key = JSON.stringify({
      question: (q.question || '').trim(),
      personas: (Array.isArray(q.personas) ? [...q.personas].sort() : undefined),
      useCases: (Array.isArray(q.useCases) ? [...q.useCases].sort() : undefined)
    });
    if (!q.question || seen.has(key)) return;
    seen.add(key);
    accumulated.push(q);
  }
  for (const uc of useCases) {
    const ucId = (uc?.id ?? uc?.name ?? '').toString();
    const nested: Array<any> = Array.isArray(uc?.keyQuestions) ? uc.keyQuestions : [];
    for (const kq of nested) {
      const question = (kq?.question ?? '').toString();
      const rationale = kq?.rationale ? String(kq.rationale) : undefined;
      if (question) pushUnique({ question, ...(rationale !== undefined ? { rationale } : {}), ...(ucId ? { useCases: [ucId] } : {}) });
    }
    if ('keyQuestions' in uc) delete uc.keyQuestions;
  }
  for (const pg of personaGroups) {
    const persona: string | undefined = pg?.persona ? String(pg.persona) : undefined;
    const linkedUseCases: Array<string> = Array.isArray(pg?.useCases) ? pg.useCases.map((v: any) => String(v)) : [];
    const nested: Array<any> = Array.isArray(pg?.keyQuestions) ? pg.keyQuestions : [];
    for (const kq of nested) {
      const question = (kq?.question ?? '').toString();
      const rationale = kq?.rationale ? String(kq.rationale) : undefined;
      pushUnique({
        question,
        ...(rationale !== undefined ? { rationale } : {}),
        ...(persona ? { personas: [persona] } : {}),
        ...(linkedUseCases.length ? { useCases: linkedUseCases } : {})
      });
    }
  }
  for (const kq of existingTop) {
    if (!kq) continue;
    pushUnique({
      question: String(kq.question ?? ''),
      ...(kq.rationale ? { rationale: String(kq.rationale) } : {}),
      ...(Array.isArray(kq.personas) ? { personas: kq.personas.map((p: any) => String(p)) } : {}),
      ...(Array.isArray(kq.useCases) ? { useCases: kq.useCases.map((u: any) => String(u)) } : {})
    });
  }
  clone.keyQuestions = accumulated;
  if ('personaKeyQuestions' in clone) delete clone.personaKeyQuestions;
  return clone;
}

export type AllowShape = { [key: string]: AllowShape | true } & { __array?: AllowShape };
export function ensurePath(shape: AllowShape, parts: string[]): AllowShape {
  let cur = shape; for (const p of parts) { if (!p) continue; if (!cur[p]) cur[p] = {} as any; cur = cur[p] as AllowShape; } return cur;
}

export function ensureSeededEnvironments(data: any): any {
  const clone = { ...(data || {}) };
  const envs = Array.isArray(clone.environments) ? clone.environments : [];
  if (envs.length === 0) clone.environments = [{ name: 'dev' }, { name: 'prod' }];
  return clone;
}


export function pruneToAllowedShape(input: any, shape: AllowShape): any {
  if (!input || typeof input !== 'object') return {};
  const out: any = {};
  for (const [k, v] of Object.entries(input)) {
    const node = (shape as any)[k];
    if (!node) continue;
    if ((node as any) === true) { out[k] = v; continue; }
    const nodeShape = node as AllowShape;
    if (Array.isArray(v) && nodeShape.__array) {
      const childShape = nodeShape.__array as AllowShape;
      const arr = v.map((item) => pruneToAllowedShape(item, childShape)).filter((o) => o && Object.keys(o).length > 0);
      out[k] = arr;
    } else if (v && typeof v === 'object') {
      const nested = pruneToAllowedShape(v, nodeShape);
      out[k] = nested;
    }
  }
  return out;
}

export function canonicalizeTier00(input: any): any {
  const data = JSON.parse(JSON.stringify(input || {}));
  if (data.businessContext && Array.isArray(data.businessContext.useCases)) {
    const cleaned: any[] = [];
    const seen = new Set<string>();
    data.businessContext.useCases.forEach((uc: any, index: number) => {
      const name = String(uc?.name ?? '').trim();
      const description = uc?.description !== undefined ? String(uc.description) : undefined;
      if (!name) return;
      let id = String(uc?.id ?? '') || name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').replace(/_{2,}/g, '_') || `use_case_${index + 1}`;
      let base = id; let suffix = 2; while (seen.has(id)) id = `${base}_${suffix++}`; seen.add(id);
      cleaned.push({ id, name, ...(description ? { description } : {}) });
    });
    data.businessContext.useCases = cleaned;
  }
  if (Array.isArray(data.personas)) {
    data.personas = data.personas
      .map((p: any) => ({ name: String(p?.name ?? '').trim(), description: p?.description ? String(p.description) : undefined }))
      .filter((p: any) => p.name.length > 0);
  }
  if (Array.isArray(data.keyQuestions)) {
    const personaNames = new Set((Array.isArray(data.personas) ? data.personas : []).map((p: any) => String(p?.name ?? '')));
    const useCaseIds = new Set((data?.businessContext?.useCases ?? []).map((uc: any) => String(uc?.id ?? '')));
    data.keyQuestions = data.keyQuestions
      .map((kq: any) => {
        const question = String(kq?.question ?? '').trim();
        const rationale = kq?.rationale ? String(kq.rationale) : undefined;
        const personas = Array.isArray(kq?.personas) ? kq.personas.map((p: any) => String(p)).filter((p: string) => personaNames.has(p)) : undefined;
        const normalizedUseCaseRefs: string[] = Array.isArray(kq?.useCases)
          ? kq.useCases.map((u: any) => (u && typeof u === 'object' ? String(u.id ?? '') : String(u ?? '')))
          : [];
        const useCases = normalizedUseCaseRefs.filter((u: string) => useCaseIds.has(u));
        if (!question) return null;
        const out: any = { question };
        if (rationale) out.rationale = rationale;
        if (personas && personas.length > 0) out.personas = personas;
        if (useCases && useCases.length > 0) out.useCases = useCases;
        return out;
      })
      .filter(Boolean);
  }
  if (Array.isArray(data.environments)) {
    data.environments = data.environments.map((env: any) => {
      const out: any = {};
      const name = String(env?.name ?? '').trim();
      const cdf_cluster = String(env?.cdf_cluster ?? '').trim();
      if (name) out.name = name;
      if (cdf_cluster) out.cdf_cluster = cdf_cluster;
      if (env?.cdf_region) out.cdf_region = String(env.cdf_region);
      if (env?.cdf_project) out.cdf_project = String(env.cdf_project);
      if (env?.idp_tenant_id) out.idp_tenant_id = String(env.idp_tenant_id);
      if (env?.admin_group_source_id) out.admin_group_source_id = String(env.admin_group_source_id);
      if (env?.user_group_source_id) out.user_group_source_id = String(env.user_group_source_id);
      if (env?.authentication && typeof env.authentication === 'object') {
        const a: any = env.authentication; const auth: any = {};
        if (a.method) auth.method = String(a.method);
        if (a.authority) auth.authority = String(a.authority);
        if (a.tokenUrl) auth.tokenUrl = String(a.tokenUrl);
        if (a.audience) auth.audience = String(a.audience);
        if (a.clientId) auth.clientId = String(a.clientId);
        if (a.clientSecret) auth.clientSecret = String(a.clientSecret);
        if (a.certificateThumbprint) auth.certificateThumbprint = String(a.certificateThumbprint);
        if (Array.isArray(a.scopes)) auth.scopes = a.scopes.map((s: any) => String(s));
        if (a.redirectUri) auth.redirectUri = String(a.redirectUri);
        if (a.token) auth.token = String(a.token);
        out.authentication = auth;
      }
      return out;
    });
  }
  if (String(data?.governanceBaseline || '').toLowerCase() === 'default') { if ('accessRoles' in data) delete data.accessRoles; }
  if (data.globalStandards && typeof data.globalStandards === 'object') {
    const gs = data.globalStandards; const cleanedGS: any = {};
    if (gs?.timestampStandard) cleanedGS.timestampStandard = String(gs.timestampStandard);
    if (gs?.prefixExternalIdsWithModuleId !== undefined) cleanedGS.prefixExternalIdsWithModuleId = Boolean(gs.prefixExternalIdsWithModuleId);
    if (gs?.naming && typeof gs.naming === 'object') {
      const nm: any = {};
      if (gs.naming?.caseStyle) nm.caseStyle = String(gs.naming.caseStyle);
      if (gs.naming?.idSeparator) nm.idSeparator = String(gs.naming.idSeparator);
      if (gs.naming?.nameSeparator) nm.nameSeparator = String(gs.naming.nameSeparator);
      if (gs.naming?.prefixes && typeof gs.naming.prefixes === 'object') {
        const pf: any = {}; const pfx = gs.naming.prefixes;
        if (pfx?.extractionPipeline) pf.extractionPipeline = String(pfx.extractionPipeline);
        if (pfx?.transformation) pf.transformation = String(pfx.transformation);
        if (pfx?.function) pf.function = String(pfx.function);
        if (pfx?.authGroup) pf.authGroup = String(pfx.authGroup);
        if (pfx?.securityCategory) pf.securityCategory = String(pfx.securityCategory);
        if (pfx?.space) pf.space = String(pfx.space);
        if (Object.keys(pf).length > 0) nm.prefixes = pf;
      }
      if (Object.keys(nm).length > 0) cleanedGS.naming = nm;
    }
    data.globalStandards = cleanedGS;
  }
  if ('variables' in data) delete data.variables; if ('promotion' in data) delete data.promotion; if ('toolkit' in data) delete data.toolkit;
  return data;
}

export async function emitTier00Yaml(data: any): Promise<string> {
  const yamlData = (() => { const d = { ...data }; if ('repositoryRoot' in d) delete d.repositoryRoot; return d; })();
  return emitYaml(yamlData, { indent: 2 });
}


