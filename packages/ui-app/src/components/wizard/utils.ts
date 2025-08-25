export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

export function isEmptyStructure(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (isPlainObject(value)) return Object.keys(value).length === 0;
  return false;
}

export function deepClean<T = any>(value: T): T | undefined {
  if (value === null || value === undefined) return undefined as any;
  if (Array.isArray(value)) return (value.map((v) => deepClean(v)).filter((v) => !isEmptyStructure(v)) as any) || undefined;
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const cleaned = deepClean(v as any);
      if (!isEmptyStructure(cleaned)) out[k] = cleaned as unknown;
    }
    return (Object.keys(out).length > 0 ? (out as unknown as T) : undefined) as any;
  }
  if (typeof value === 'string') {
    const t = value.trim();
    return (t.length > 0 ? (t as unknown as T) : undefined) as any;
  }
  return value;
}

export function dropBlankEnvironments<T extends { environments?: unknown }>(data: T): T {
  try {
    const envs: any[] = Array.isArray((data as any)?.environments) ? ((data as any).environments as any[]) : [];
    const filtered = envs.filter((env: any) => String(env?.name ?? '').trim().length > 0);
    if (filtered.length === envs.length) return data;
    return { ...(data as any), environments: filtered } as T;
  } catch {
    return data;
  }
}


