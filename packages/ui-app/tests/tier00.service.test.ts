import { describe, it, expect } from 'vitest';
import { normalizeKeyQuestions, canonicalizeTier00, emitTier00Yaml } from '../src/features/tier00/services/index.js';

describe('tier00 services', () => {
  it('normalizes key questions from nested structures', () => {
    const input = { businessContext: { useCases: [{ id: 'uc1', keyQuestions: [{ question: 'Q1' }] }] }, personaKeyQuestions: [{ persona: 'P1', keyQuestions: [{ question: 'Q2' }] }] };
    const out = normalizeKeyQuestions(input);
    expect(Array.isArray(out.keyQuestions)).toBe(true);
    const qs = out.keyQuestions.map((q: any) => q.question);
    expect(qs).toContain('Q1');
    expect(qs).toContain('Q2');
  });

  it('canonicalizes personas and environments', () => {
    const input = { personas: [{ name: 'A' }, { name: '' }], environments: [{ name: 'dev', cdf_project: 'p' }, { name: '' }] };
    const out = canonicalizeTier00(input);
    expect(out.personas.length).toBe(1);
    expect(out.environments[0].name).toBe('dev');
  });

  it('emits yaml text', async () => {
    const yaml = await emitTier00Yaml({ schemaVersion: 1, businessContext: { useCases: [] }, environments: [] });
    expect(typeof yaml).toBe('string');
    expect(yaml).toMatch(/schemaVersion/);
  });
});


