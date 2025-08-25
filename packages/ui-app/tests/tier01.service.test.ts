import { describe, it, expect } from 'vitest';
import { emitTier01Yaml } from '../src/features/tier01/services/index.js';

describe('tier01 services', () => {
  it('emits yaml', async () => {
    const yaml = await emitTier01Yaml({ schemaVersion: 1, moduleId: 'm', objects: [] });
    expect(yaml).toMatch(/moduleId: m/);
  });
});


