import { describe, it, expect } from 'vitest';
import { wizardReducer, type WizardState } from '../src/components/wizard/Provider.js';

describe('wizardReducer', () => {
  const base: WizardState = {
    data: {},
    isSaving: false,
    error: null,
    completedSteps: {},
    stepValidation: {},
    showUnsavedWarning: false,
    showValidationWarning: false,
    validationWarningDetails: null,
    pendingAction: null,
  };

  it('initializes data', () => {
    const s = wizardReducer(base, { type: 'INITIALIZE', payload: { a: 1 } });
    expect(s.data).toEqual({ a: 1 });
  });

  it('marks completed and stores validation', () => {
    const s1 = wizardReducer(base, { type: 'SET_STEP_VALIDATION', payload: { stepId: 's1', validation: { status: 'valid' } } });
    expect(s1.stepValidation['s1']).toEqual({ status: 'valid' });
    const s2 = wizardReducer(s1, { type: 'MARK_COMPLETED', payload: 's1' });
    expect(s2.completedSteps['s1']).toBe(true);
  });

  it('shows unsaved warning with pending action', () => {
    const s = wizardReducer(base, { type: 'SHOW_UNSAVED_WARNING', payload: { show: true, pending: { kind: 'navigate', toIndex: 2 } } });
    expect(s.showUnsavedWarning).toBe(true);
    expect(s.pendingAction).toEqual({ kind: 'navigate', toIndex: 2 });
  });
});


