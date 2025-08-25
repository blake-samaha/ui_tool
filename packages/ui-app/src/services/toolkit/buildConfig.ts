export function buildConfigObjectsFromUI(data: any): Record<string, any> {
  const envs: Array<any> = Array.isArray(data?.environments) ? data.environments : [];
  const selectedByEnv: Record<string, string[]> = {};
  for (const env of envs) {
    const name = String(env?.name || '');
    if (!name) continue;
    if (Array.isArray(env?.selectedModules)) selectedByEnv[name] = env.selectedModules.filter((s: any) => typeof s === 'string');
  }
  const standards: Record<string, any> = {};
  if (data?.globalStandards && typeof data.globalStandards === 'object') {
    const gs = data.globalStandards; const naming = gs?.naming || {};
    if (naming?.prefixes && typeof naming.prefixes === 'object') {
      const p = naming.prefixes;
      if (p.space) standards.spacePrefix = String(p.space);
      if (p.transformation) standards.transformationPrefix = String(p.transformation);
      if (p.authGroup) standards.groupPrefix = String(p.authGroup);
    }
  }
  const configs: Record<string, any> = {};
  for (const env of envs) {
    const name = String(env?.name || '').trim(); if (!name) continue;
    const project = String(env?.cdf_project || '').trim();
    const selected = selectedByEnv[name] || [];
    const obj: any = {
      environment: {
        name,
        ...(project ? { project } : {}),
        ...(env?.type ? { type: String(env.type) } : {}),
        ...(selected.length ? { selected } : {})
      },
    };
    if (Object.keys(standards).length) obj.variables = { standards };
    configs[name] = obj;
  }
  return configs;
}


