import { Spinner } from '@docs-as-code/ui-components';

export interface FooterNavProps {
  currentIndex: number;
  total: number;
  isSaving: boolean;
  isDirty: boolean;
  onBack: () => void;
  onSave: () => void;
  onNextOrFinish: () => void;
}

export function FooterNav({ currentIndex, total, isSaving, isDirty, onBack, onSave, onNextOrFinish }: FooterNavProps) {
  const isLast = currentIndex === total - 1;
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-30">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={onBack}
              disabled={currentIndex === 0 || isSaving}
              aria-label="Go back to previous step"
            >
              <span>←</span>
              Back
            </button>
            {isDirty && (
              <div className="sm:hidden flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                Unsaved
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Spinner size="sm" />
                <span>Saving...</span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
              <span>Step {currentIndex + 1} of {total}</span>
              {isDirty && (
                <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  Unsaved
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                onClick={onSave}
                disabled={isSaving || !isDirty}
                aria-label="Manually save current progress"
              >
                {isSaving ? (
                  <>
                    <Spinner size="sm" />
                    Saving...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span className="hidden sm:inline">Save</span>
                  </>
                )}
              </button>
              <button
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                onClick={onNextOrFinish}
                disabled={isSaving}
                aria-label={isLast ? 'Finish wizard' : 'Continue to next step'}
              >
                {isLast ? (
                  <>
                    <span>🎉</span>
                    <span className="hidden sm:inline">Finish</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Save & Continue</span>
                    <span className="sm:hidden">Continue</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


