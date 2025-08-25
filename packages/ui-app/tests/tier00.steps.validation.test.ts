import { describe, it, expect } from 'vitest';
import { tier00Steps } from '../src/features/tier00/steps.js';

function getStep(id: string) {
  const s = tier00Steps.find((x) => x.id === id);
  if (!s) throw new Error(`step ${id} not found`);
  return s;
}

describe('tier00 step validators', () => {
  it('repo-setup requires repositoryRoot', () => {
    const s = getStep('repo-setup');
    const res1 = s.validate?.({});
    expect(res1).toBeDefined();
    expect(res1!.status).toBe('error');
    const res2 = s.validate?.({ repositoryRoot: '/tmp/repo' });
    expect(res2!.status).toBe('valid');
  });

  it('project-basics warns when optional fields missing and errors when customerName missing', () => {
    const s = getStep('project-basics');
    expect(s.validate?.({ customerName: '' })!.status).toBe('error');
    const ok = s.validate?.({ customerName: 'Acme' });
    expect(['valid', 'warning']).toContain(ok!.status);
  });

  it('environments requires at least one env with name and cdf_project', () => {
    const s = getStep('environments');
    expect(s.validate?.({ environments: [] })!.status).toBe('error');
    const res = s.validate?.({ environments: [{ name: 'dev', cdf_project: 'proj' }] });
    expect(res!.status).toBe('valid');
  });
});
