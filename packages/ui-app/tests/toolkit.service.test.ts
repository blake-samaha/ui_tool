import { describe, it, expect } from 'vitest';
import { buildConfigObjectsFromUI, validateConfigObject } from '../src/services/toolkit.js';

describe('toolkit services', () => {
  it('builds config objects from UI-state', () => {
    const ui = {
      environments: [
        { name: 'dev', cdf_project: 'proj-dev' },
        { name: 'prod', cdf_project: 'proj-prod' }
      ],
      envModules: { dev: ['m1', 'm2'] },
      globalStandards: { naming: { prefixes: { space: 'sp_', transformation: 'tr', authGroup: 'gp' } } }
    } as any;
    const cfgs = buildConfigObjectsFromUI(ui);
    expect(Object.keys(cfgs)).toContain('dev');
    expect(cfgs.dev.environment.name).toBe('dev');
    expect(cfgs.dev.environment.project).toBe('proj-dev');
    expect(cfgs.dev.environment.selected).toEqual(['m1', 'm2']);
    expect(cfgs.dev.variables.standards.spacePrefix).toBe('sp_');
  });

  it('validates minimal config objects', () => {
    const ok = { environment: { name: 'dev', project: 'proj' } };
    const errsOk = validateConfigObject(ok);
    expect(errsOk.length).toBe(0);

    const bad = { environment: { name: '', project: '' } } as any;
    const errsBad = validateConfigObject(bad);
    expect(errsBad.length).toBeGreaterThan(0);
  });
});
