export function validateConfigObject(cfg: any): string[] {
  const errors: string[] = [];
  if (!cfg || typeof cfg !== 'object') { errors.push('config must be an object'); return errors; }
  const env = cfg.environment;
  if (!env || typeof env !== 'object') { errors.push('environment object is required'); return errors; }
  const name = env.name;
  if (typeof name !== 'string' || name.trim().length === 0) errors.push('environment.name must be a non-empty string');
  const project = env.project;
  if (typeof project !== 'string' || project.trim().length === 0) errors.push('environment.project must be a non-empty string');
  if (env.selected !== undefined) {
    if (!Array.isArray(env.selected) || env.selected.some((s: any) => typeof s !== 'string')) {
      errors.push('environment.selected must be an array of strings when present');
    }
  }
  if (cfg.variables !== undefined && (typeof cfg.variables !== 'object' || Array.isArray(cfg.variables))) {
    errors.push('variables must be an object when present');
  }
  return errors;
}


