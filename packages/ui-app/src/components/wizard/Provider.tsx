import React from 'react';
import type { ValidationResult } from './types.js';

export type PendingAction =
  | { kind: 'navigate'; toIndex: number }
  | { kind: 'finish' }
  | { kind: 'manualSave' }
  | null;

export type ErrorState = {
  type: 'validation' | 'network' | 'system';
  message: string;
  recoverable: boolean;
  details?: any;
};

export type WizardState = {
  data: any;
  isSaving: boolean;
  error: ErrorState | null;
  completedSteps: Record<string, true>;
  stepValidation: Record<string, ValidationResult>;
  showUnsavedWarning: boolean;
  showValidationWarning: boolean;
  validationWarningDetails: { message: string; details?: string[]; isError?: boolean; blockContinue?: boolean } | null;
  pendingAction: PendingAction;
};

export type WizardAction =
  | { type: 'INITIALIZE'; payload: any }
  | { type: 'SET_DATA'; payload: any }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: ErrorState | null }
  | { type: 'MARK_COMPLETED'; payload: string }
  | { type: 'SET_STEP_VALIDATION'; payload: { stepId: string; validation: ValidationResult } }
  | { type: 'SHOW_UNSAVED_WARNING'; payload: { show: boolean; pending?: PendingAction } }
  | { type: 'SHOW_VALIDATION_WARNING'; payload: { show: boolean; details?: { message: string; details?: string[]; isError?: boolean; blockContinue?: boolean }; pending?: PendingAction } };

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...state, data: action.payload, error: null };
    case 'SET_DATA':
      return { ...state, data: action.payload };
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isSaving: false };
    case 'MARK_COMPLETED':
      return { ...state, completedSteps: { ...state.completedSteps, [action.payload]: true }, error: null, isSaving: false };
    case 'SET_STEP_VALIDATION':
      return { ...state, stepValidation: { ...state.stepValidation, [action.payload.stepId]: action.payload.validation } };
    case 'SHOW_UNSAVED_WARNING':
      return { ...state, showUnsavedWarning: action.payload.show, pendingAction: action.payload.pending ?? state.pendingAction };
    case 'SHOW_VALIDATION_WARNING':
      return { ...state, showValidationWarning: action.payload.show, validationWarningDetails: action.payload.details ?? null, pendingAction: action.payload.pending ?? state.pendingAction };
    default:
      return state;
  }
}

export type WizardContextValue = {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
};

export const WizardContext = React.createContext<WizardContextValue | undefined>(undefined);

export function useWizard(): WizardContextValue {
  const ctx = React.useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used within a WizardProvider');
  return ctx;
}

export function WizardProvider({ initialData, children }: { initialData: any; children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(wizardReducer, {
    data: initialData,
    isSaving: false,
    error: null,
    completedSteps: {},
    stepValidation: {},
    showUnsavedWarning: false,
    showValidationWarning: false,
    validationWarningDetails: null,
    pendingAction: null,
  });

  React.useEffect(() => {
    dispatch({ type: 'INITIALIZE', payload: initialData });
  }, [initialData]);

  return (
    <WizardContext.Provider value={{ state, dispatch }}>
      {children}
    </WizardContext.Provider>
  );
}

export function createError(type: ErrorState['type'], message: string, recoverable = true, details?: any): ErrorState {
  return { type, message, recoverable, details };
}


