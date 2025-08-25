import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { FormRenderer, type FormRendererHandle } from '@docs-as-code/form-renderer';
import type { WizardStep, ValidationResult } from './types.js';
import { ProjectContext } from '../../state/ProjectContext.js';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';
import { WizardProvider, useWizard, createError, type PendingAction } from './Provider.js';
import { StepSidebar } from './StepSidebar.js';
import { FooterNav } from './FooterNav.js';
import { UnsavedChangesModal, ValidationWarningModal, CommandFailedModal } from './Modals.js';
import { ConfirmModal } from '@docs-as-code/ui-components';
import { WizardProgress } from './WizardProgress.js';
import { ErrorBoundary } from './ErrorBoundary.js';
import { deepClean, dropBlankEnvironments } from './utils.js';

// helpers moved to utils.ts

// Deep-clean helpers to remove blank entries before validation/save
// removed duplicate helpers

type WizardShellProps = {
  steps: WizardStep[];
  initialData: any;
  onChange: (data: any) => void;
  onSaveStep: (data: any) => Promise<void>;
  onFinish: (data: any) => Promise<void>;
  phase?: 'phase1' | 'phase2' | 'phase2x' | 'phase3' | 'phase4';
};

export function WizardShell({ steps, initialData, onChange: _onChange, onSaveStep, onFinish, phase }: WizardShellProps) {
  return (
    <WizardProvider initialData={initialData}>
      <WizardShellInner steps={steps} onChange={() => { /* delegated to inner */ }} onSaveStep={onSaveStep} onFinish={onFinish} phase={phase} />
    </WizardProvider>
  );
}

function WizardShellInner({ steps, onChange: _onChange, onSaveStep, onFinish, phase }: Omit<WizardShellProps, 'initialData'>) {
  const ctx = React.useContext(ProjectContext);
  const bridgeBaseUrl = ctx?.settings.bridgeBaseUrl || 'http://127.0.0.1:45678';
  const client = React.useMemo(() => new FileBridgeClient({ baseUrl: bridgeBaseUrl }), [bridgeBaseUrl]);
  const [params, setParams] = useSearchParams();
  const { state, dispatch } = useWizard();
  const formRef = React.useRef<FormRendererHandle | null>(null);

  const visibleSteps = steps;

  // Resolve current step from URL, but fall back to first visible step if hidden/invalid
  const requestedStepId = params.get('step') || undefined;
  const effectiveStepId = requestedStepId && visibleSteps.some((s) => s.id === requestedStepId)
    ? requestedStepId
    : visibleSteps[0]?.id;
  const idx = Math.max(0, visibleSteps.findIndex((s) => s.id === effectiveStepId));
  const step = visibleSteps[idx] ?? visibleSteps[0];

  // If URL points to a hidden step (e.g., access-roles when baseline is default), update it
  React.useEffect(() => {
    const current = params.get('step');
    if (current && !visibleSteps.some((s) => s.id === current)) {
      setParams((p) => {
        if (visibleSteps[0]?.id) {
          p.set('step', visibleSteps[0].id);
        } else {
          p.delete('step');
        }
        return p;
      }, { replace: true });
    }
  }, [visibleSteps, params, setParams]);

  const latestRef = React.useRef<any>(state.data);
  const savedRef = React.useRef<any>(state.data);
  const [formKey, setFormKey] = React.useState(0);
  const [commandModal, setCommandModal] = React.useState<{ open: boolean; message: string; retry: null | (() => Promise<void>) }>({ open: false, message: '', retry: null });
  const [finishSuccess, setFinishSuccess] = React.useState<{ open: boolean; message: string } | null>(null);

  const [isDirty, setIsDirty] = React.useState(false);
  React.useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) { if (!isDirty) return; e.preventDefault(); e.returnValue = ''; }
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [isDirty]);

  React.useEffect(() => { latestRef.current = state.data; }, [state.data]);

  // no localStorage persistence


  const stepContentRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    // Focus the step content when navigating between steps
    if (stepContentRef.current) {
      const firstInput = stepContentRef.current.querySelector('input, textarea, select');
      if (firstInput) {
        (firstInput as HTMLElement).focus();
      }
    }
  }, [idx]);



  const handleFormChange = React.useCallback((incoming: any) => {
    latestRef.current = incoming;
    dispatch({ type: 'SET_DATA', payload: incoming });
  }, [dispatch]);

  const goTo = React.useCallback(async (i: number, opts?: { skipDirtyCheck?: boolean }) => {
    const s = visibleSteps[i];
    if (!s) return;
    
    if (!opts?.skipDirtyCheck && isDirty) {
      dispatch({ type: 'SHOW_UNSAVED_WARNING', payload: { show: true, pending: { kind: 'navigate', toIndex: i } } });
      return;
    }
    
    setParams((p) => {
      p.set('step', s.id);
      return p;
    }, { replace: true });
  }, [visibleSteps, isDirty, setParams, dispatch]);

  const handleSaveAndContinue = React.useCallback(async () => {
    if (!state.pendingAction || !step) return;
    dispatch({ type: 'SET_SAVING', payload: true });
    try {
      const effective = latestRef.current ?? state.data;
      const cleaned = dropBlankEnvironments(deepClean(effective) ?? {});
      latestRef.current = cleaned;
      dispatch({ type: 'SET_DATA', payload: cleaned });
      await onSaveStep(cleaned);
      savedRef.current = cleaned;
      dispatch({ type: 'SET_STEP_VALIDATION', payload: { stepId: step.id, validation: { status: 'valid' } } });
      dispatch({ type: 'MARK_COMPLETED', payload: step.id });
      dispatch({ type: 'SHOW_UNSAVED_WARNING', payload: { show: false } });
      const act = state.pendingAction;
      if (act && act.kind === 'navigate') await goTo(act.toIndex, { skipDirtyCheck: true });
      if (act && act.kind === 'finish') {
        await onFinish(cleaned);
        setFinishSuccess({ open: true, message: 'Phase completed successfully.' });
      }
      if (act && act.kind === 'manualSave') formRef.current?.resetDirty();
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: createError('network', `Failed to save: ${error.message}`, true, error) });
      if (step) dispatch({ type: 'SET_STEP_VALIDATION', payload: { stepId: step.id, validation: { status: 'error', message: 'Command failed', details: [String(error?.message || error)] } } });
      setCommandModal({
        open: true,
        message: String(error?.message || error),
        retry: async () => {
          const effective = latestRef.current ?? state.data;
          const cleaned = dropBlankEnvironments(deepClean(effective) ?? {});
          latestRef.current = cleaned;
          dispatch({ type: 'SET_DATA', payload: cleaned });
          await onSaveStep(cleaned);
          savedRef.current = cleaned;
          dispatch({ type: 'SET_STEP_VALIDATION', payload: { stepId: step.id!, validation: { status: 'valid' } } });
          dispatch({ type: 'SHOW_UNSAVED_WARNING', payload: { show: false } });
          setCommandModal({ open: false, message: '', retry: null });
        }
      });
    }
  }, [state.pendingAction, state.data, onSaveStep, onFinish, step, goTo, dispatch]);

  const handleDiscardChanges = React.useCallback(async () => {
    const act = state.pendingAction;
    dispatch({ type: 'SHOW_UNSAVED_WARNING', payload: { show: false } });
    const revert = savedRef.current ?? state.data;
    latestRef.current = revert;
    dispatch({ type: 'INITIALIZE', payload: revert });
    setFormKey((k) => k + 1);
    if (act && act.kind === 'navigate') await goTo(act.toIndex, { skipDirtyCheck: true });
  }, [state.pendingAction, state.data, goTo, dispatch]);

  const handleCancelNavigation = React.useCallback(() => {
    dispatch({ type: 'SHOW_UNSAVED_WARNING', payload: { show: false } });
  }, [dispatch]);

  const handleNext = React.useCallback(async (nextIsFinish = false, skipValidation = false) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    
    if (!step) return;
    
    const effective = latestRef.current ?? state.data;
    const cleaned = dropBlankEnvironments(deepClean(effective) ?? {});
    latestRef.current = cleaned;
    dispatch({ type: 'SET_DATA', payload: cleaned });
    
    // Run validation if not skipped
    if (!skipValidation) {
      // Enforce at least one access role when baseline is custom
      // Access Roles validation removed

      if (step.validate) {
        const validationResult = step.validate(cleaned);
        const normalizedResult = validationResult as ValidationResult;
        
        // Store validation result for step coloring
        dispatch({ 
          type: 'SET_STEP_VALIDATION', 
          payload: { stepId: step.id, validation: normalizedResult } 
        });
        
        if (normalizedResult.status === 'error' || normalizedResult.status === 'warning') {
          const isError = normalizedResult.status === 'error';
          const pending: PendingAction = nextIsFinish ? { kind: 'finish' } : { kind: 'navigate', toIndex: idx + 1 };
          dispatch({ type: 'SHOW_VALIDATION_WARNING', payload: { show: true, details: { message: normalizedResult.message!, details: normalizedResult.details, isError }, pending } });
          return;
        }
      }
    }
    
    dispatch({ type: 'SET_SAVING', payload: true });
    try {
      await onSaveStep(cleaned);
      savedRef.current = cleaned;
      dispatch({ type: 'SET_STEP_VALIDATION', payload: { stepId: step.id, validation: { status: 'valid' } } });
      dispatch({ type: 'MARK_COMPLETED', payload: step.id });
      
      if (nextIsFinish) {
        await onFinish(cleaned);
        setFinishSuccess({ open: true, message: 'Phase completed successfully.' });
        return;
      }
      
      await goTo(idx + 1, { skipDirtyCheck: true });
    } catch (error: any) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: createError('network', `Failed to save: ${error.message}`, true, error) 
      });
      if (step) dispatch({ type: 'SET_STEP_VALIDATION', payload: { stepId: step.id, validation: { status: 'error', message: 'Command failed', details: [String(error?.message || error)] } } });
      setCommandModal({
        open: true,
        message: String(error?.message || error),
        retry: async () => {
          const effective2 = latestRef.current ?? state.data;
          const cleaned2 = dropBlankEnvironments(deepClean(effective2) ?? {});
          latestRef.current = cleaned2;
          dispatch({ type: 'SET_DATA', payload: cleaned2 });
          await onSaveStep(cleaned2);
          savedRef.current = cleaned2;
          dispatch({ type: 'SET_STEP_VALIDATION', payload: { stepId: step.id!, validation: { status: 'valid' } } });
          if (nextIsFinish) await onFinish(cleaned2); else await goTo(idx + 1, { skipDirtyCheck: true });
          setCommandModal({ open: false, message: '', retry: null });
        }
      });
    }
  }, [step, state.data, onSaveStep, onFinish, goTo, idx, dispatch]);

  const handleBack = React.useCallback(async () => {
    dispatch({ type: 'SET_ERROR', payload: null });
    await goTo(idx - 1);
  }, [goTo, idx]);

  const handleManualSave = React.useCallback(async (skipValidation = false) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    
    if (!step) return;
    
    const effective = latestRef.current ?? state.data;
    const cleaned = dropBlankEnvironments(deepClean(effective) ?? {});
    latestRef.current = cleaned;
    dispatch({ type: 'SET_DATA', payload: cleaned });
    
    // Run validation on manual save too - same as Save & Continue
    if (!skipValidation) {
      if (step.validate) {
        const validationResult = step.validate(cleaned);
        const normalizedResult = validationResult as ValidationResult;
        
        // Store validation result for step coloring
        dispatch({ 
          type: 'SET_STEP_VALIDATION', 
          payload: { stepId: step.id, validation: normalizedResult } 
        });
        
        if (normalizedResult.status === 'error' || normalizedResult.status === 'warning') {
          const isError = normalizedResult.status === 'error';
          dispatch({ type: 'SHOW_VALIDATION_WARNING', payload: { show: true, details: { message: normalizedResult.message!, details: normalizedResult.details, isError }, pending: { kind: 'manualSave' } } });
          return;
        }
      }
    }
    
    dispatch({ type: 'SET_SAVING', payload: true });
    
    try {
      await onSaveStep(cleaned);
      savedRef.current = cleaned;
      dispatch({ type: 'SET_STEP_VALIDATION', payload: { stepId: step.id, validation: { status: 'valid' } } });
      dispatch({ type: 'MARK_COMPLETED', payload: step.id });
      formRef.current?.resetDirty();
    } catch (error: any) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: createError('network', `Failed to save: ${error.message}`, true, error) 
      });
    }
  }, [state.data, onSaveStep, step, dispatch]);

  const handleValidationWarningContinue = React.useCallback(async () => {
    if (!state.pendingAction) return;
    dispatch({ type: 'SHOW_VALIDATION_WARNING', payload: { show: false } });
    if (state.pendingAction.kind === 'finish') await handleNext(true, true);
    else if (state.pendingAction.kind === 'manualSave') await handleManualSave(true);
    else if (state.pendingAction.kind === 'navigate') await handleNext(false, true);
  }, [state.pendingAction, handleNext, handleManualSave, dispatch]);

  const handleValidationWarningCancel = React.useCallback(() => {
    dispatch({ type: 'SHOW_VALIDATION_WARNING', payload: { show: false } });
  }, [dispatch]);

  // Use-case unlink flow removed in simplified controller

  const handleDirtyChange = React.useCallback((dirty: boolean) => setIsDirty(dirty), []);

  const handleFormSubmit = React.useCallback((partial: any) => {
    const merged = { ...state.data, ...partial };
    latestRef.current = merged;
    dispatch({ type: 'SET_DATA', payload: merged });
  }, [state.data, dispatch]);

  const handleDirectoryPick = React.useCallback(async () => {
    try {
      const picked = await client.pickRoot();
      return picked || undefined;
    } catch {
      return undefined;
    }
  }, [client]);

  // Calculate progress percentage
  const completedCount = Object.keys(state.completedSteps).filter((id) => visibleSteps.some((s) => s.id === id)).length;
  const totalSteps = visibleSteps.length;

  // Enhanced error component
  const renderError = () => {
    if (!state.error) return null;

    const errorIcon = state.error.type === 'validation' ? '⚠️' : state.error.type === 'network' ? '🌐' : '❌';
    const errorBgColor = state.error.type === 'validation' ? 'bg-amber-50 ring-amber-200' : 'bg-red-50 ring-red-200';
    const errorTextColor = state.error.type === 'validation' ? 'text-amber-800' : 'text-red-800';

    return (
      <div className={`rounded-xl p-4 ring-1 ${errorBgColor}`} role="alert">
        <div className={`font-medium mb-2 ${errorTextColor} flex items-center gap-2`}>
          <span>{errorIcon}</span>
          {state.error.type === 'validation' ? 'Validation Error' : 
           state.error.type === 'network' ? 'Network Error' : 'System Error'}
        </div>
        <div className={`text-sm ${errorTextColor.replace('800', '700')} mb-3`}>
          {state.error.message}
        </div>
        {state.error.recoverable && (
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              state.error.type === 'validation' 
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
            onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}
          >
            Dismiss
          </button>
        )}
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="space-y-4 pb-24">
        <WizardProgress phase={phase} completedCount={completedCount} totalSteps={totalSteps} />
        <div className="flex gap-8">
          <StepSidebar
            steps={visibleSteps}
            currentIndex={idx}
            completedSteps={state.completedSteps}
            stepValidation={state.stepValidation}
            isSaving={state.isSaving}
            onNavigate={(i) => goTo(i)}
          />
          {/* Enhanced Main Content Area */}
          <main className="flex-1 space-y-5">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{step?.title}</h1>
              {step?.help && <p className="text-sm text-slate-600">{step.help}</p>}
              {isDirty && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <span>●</span>
                  <span>Unsaved changes</span>
                </div>
              )}
            </div>

            {/* Enhanced Form Container with focus management */}
            <div 
              ref={stepContentRef}
              className="rounded-xl bg-white p-6 ring-1 ring-slate-200"
              role="tabpanel"
              id={`wizard-panel-${step?.id}`}
              aria-labelledby={step ? `wizard-tab-${step.id}` : undefined}
              tabIndex={0}
            >
              {step && (
                <FormRenderer
                  key={formKey}
                  uiSchema={step.uiSchema}
                  defaultValues={state.data}
                  onSubmit={handleFormSubmit}
                  onChange={handleFormChange}
                  onDirectoryPick={handleDirectoryPick}
                  onDirtyChange={handleDirtyChange}
                  ref={formRef as any}
                  externalResetCounter={undefined}
                  hideSubmit
                />
              )}
            </div>

            {/* Enhanced Error Display */}
            {renderError()}

            {/* Add some bottom padding to account for sticky footer */}
            <div className="h-24"></div>
          </main>
        </div>

        <FooterNav
          currentIndex={idx}
          total={visibleSteps.length}
          isSaving={state.isSaving}
          isDirty={isDirty}
          onBack={handleBack}
          onSave={() => handleManualSave()}
          onNextOrFinish={() => handleNext(idx === visibleSteps.length - 1)}
        />

        <UnsavedChangesModal open={state.showUnsavedWarning} isSaving={state.isSaving} onSaveContinue={handleSaveAndContinue} onDiscard={handleDiscardChanges} onCancel={handleCancelNavigation} />

        <ValidationWarningModal
          open={state.showValidationWarning}
          details={state.validationWarningDetails}
          isSaving={state.isSaving}
          primaryLabel={state.pendingAction?.kind === 'manualSave' ? 'Save Anyway' : 'Continue Anyway'}
          onContinue={handleValidationWarningContinue}
          onBack={handleValidationWarningCancel}
        />

        <CommandFailedModal
          open={commandModal.open}
          title="Command Failed"
          stderr={commandModal.message}
          onRetry={async () => { if (commandModal.retry) await commandModal.retry(); }}
          onClose={() => setCommandModal({ open: false, message: '', retry: null })}
        />

        <ConfirmModal
          open={Boolean(finishSuccess?.open)}
          title="Success"
          message={finishSuccess?.message || 'Completed successfully.'}
          actions={[
            { label: 'Go to Phase 2', variant: 'primary', onClick: () => { try { (window as any).location.assign('/tier01'); } catch {} setFinishSuccess(null); } },
            { label: 'Stay Here', variant: 'secondary', onClick: () => setFinishSuccess(null) }
          ]}
          onClose={() => setFinishSuccess(null)}
        />

        {/* Use-case unlink flow removed */}
      </div>
    </ErrorBoundary>
  );
}
