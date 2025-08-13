import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { FormRenderer } from '@docs-as-code/form-renderer';
import type { WizardStep } from './types.js';
import { ProjectContext } from '../../state/ProjectContext.js';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';

export function WizardShell({
  steps,
  initialData,
  onChange,
  onSaveStep,
  onFinish
}: {
  steps: WizardStep[];
  initialData: any;
  onChange: (data: any) => void;
  onSaveStep: (data: any) => Promise<void>;
  onFinish: (data: any) => Promise<void>;
}) {
  const ctx = React.useContext(ProjectContext);
  const bridgeBaseUrl = ctx?.settings.bridgeBaseUrl || 'http://127.0.0.1:45678';
  const client = React.useMemo(() => new FileBridgeClient({ baseUrl: bridgeBaseUrl }), [bridgeBaseUrl]);
  const [data, setData] = React.useState<any>(initialData);
  const [params, setParams] = useSearchParams();
  const stepId = params.get('step') || steps[0]?.id;
  const idx = Math.max(0, steps.findIndex((s) => s.id === stepId));
  const step = steps[idx] ?? steps[0];
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dirty, setDirty] = React.useState(false);
  const [resetSeq, setResetSeq] = React.useState(0);

  // Warn on browser unload if there are unsaved changes
  React.useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  async function goTo(i: number) {
    const s = steps[i];
    if (!s) return;
    if (dirty) {
      const proceed = window.confirm('You have unsaved changes. Save before navigating? Press OK to save & continue, Cancel to discard changes.');
      if (proceed) {
        setSaving(true);
        try {
          await onSaveStep(data);
          setResetSeq((v) => v + 1); // mark form pristine
          setDirty(false);
        } catch (e: any) {
          setError(String(e?.message ?? e));
        } finally {
          setSaving(false);
        }
      } else {
        // discard: do nothing special
      }
    }
    setParams((p) => {
      p.set('step', s.id);
      return p;
    }, { replace: true });
  }

  async function handleNext(nextIsFinish = false) {
    setError(null);
    const res = step && step.validate ? step.validate(data) : { ok: true as const };
    if (!res.ok) {
      setError(res.message);
      return;
    }
    // If the first step captures repository root, sync it to settings via URL param for Tier00 page to consume
    setSaving(true);
    try {
      await onSaveStep(data);
      setResetSeq((v) => v + 1);
      setDirty(false);
      if (nextIsFinish) {
        await onFinish(data);
        return;
      }
      await goTo(idx + 1);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setSaving(false);
    }
  }

  async function handleBack() {
    setError(null);
    await goTo(idx - 1);
  }

  return (
    <div className="flex gap-8">
      <aside className="w-72 shrink-0">
        <ol className="space-y-2">
          {steps.map((s, i) => (
            <li key={s.id}>
              <button
                className={`w-full text-left rounded-md px-3 py-2 ring-1 ring-slate-200 hover:bg-slate-50 ${
                  i === idx ? 'bg-blue-50 text-blue-700 ring-blue-200' : 'bg-white text-slate-700'
                }`}
                onClick={() => goTo(i)}
              >
                <span className="mr-2 text-xs tabular-nums align-middle">{i + 1}.</span>
                {s.title}
              </button>
            </li>
          ))}
        </ol>
      </aside>
      <main className="flex-1 space-y-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{step?.title}</h2>
          {step?.help && <p className="text-sm text-slate-600">{step.help}</p>}
        </div>
        <div className="rounded-xl bg-white p-6 ring-1 ring-slate-200">
          {step && (
            <FormRenderer
              uiSchema={step.uiSchema}
              defaultValues={data}
              onSubmit={(partial) => setData({ ...data, ...partial })}
              onChange={(value) => {
                // Keep local form state in sync and notify parent without creating a feedback loop
                setData(value as any);
                onChange(value);
              }}
              onDirectoryPick={async () => {
                try {
                  const picked = await client.pickRoot();
                  return picked || undefined;
                } catch {
                  return undefined;
                }
              }}
              onDirtyChange={setDirty}
              externalResetCounter={resetSeq}
              hideSubmit
            />
          )}
        </div>
        {error && <div className="text-sm text-red-700">{error}</div>}
        <div className="flex justify-between pt-2">
          <button
            className="px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
            onClick={handleBack}
            disabled={idx === 0}
          >
            Back
          </button>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              onClick={() => handleNext(idx === steps.length - 1)}
              disabled={saving}
            >
              {idx === steps.length - 1 ? 'Finish' : saving ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}


