import React from 'react';
import type { WizardStep, ValidationResult } from './types.js';
import { Spinner } from '@docs-as-code/ui-components';

export interface StepSidebarProps {
  steps: WizardStep[];
  currentIndex: number;
  completedSteps: Record<string, true>;
  stepValidation: Record<string, ValidationResult>;
  isSaving: boolean;
  onNavigate: (index: number) => void;
}

export function StepSidebar({ steps, currentIndex, completedSteps, stepValidation, isSaving, onNavigate }: StepSidebarProps) {
  return (
    <aside className="w-72 shrink-0">
      <nav aria-label="Wizard steps">
        <div role="tablist" aria-orientation="vertical" className="space-y-2">
          {steps.map((s, i) => {
            const isCompleted = Boolean(completedSteps[s.id]);
            const isCurrent = i === currentIndex;
            const validation = stepValidation[s.id];

            let statusColor = '';
            let statusIcon: React.ReactNode = null;
            if (isCurrent) {
              statusColor = 'bg-blue-50 text-blue-700 ring-blue-200';
            } else if (validation?.status === 'error') {
              statusColor = 'bg-red-50 text-red-700 ring-red-200 hover:bg-red-100';
              statusIcon = <span className="text-red-600">✕</span>;
            } else if (validation?.status === 'warning') {
              statusColor = 'bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100';
              statusIcon = <span className="text-amber-600">⚠</span>;
            } else if (isCompleted) {
              statusColor = 'bg-green-50 text-green-700 ring-green-200 hover:bg-green-100';
              statusIcon = <span className="text-green-600">✓</span>;
            } else {
              statusColor = 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50';
            }

            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={isCurrent}
                aria-current={isCurrent ? 'step' : undefined}
                id={`wizard-tab-${s.id}`}
                aria-controls={`wizard-panel-${s.id}`}
                className={`w-full text-left rounded-md px-3 py-2 ring-1 transition-all duration-200 ${statusColor}`}
                onClick={() => onNavigate(i)}
              >
                <div className="flex items-center">
                  <span className="mr-3 flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium">
                    {statusIcon || <span className="tabular-nums">{i + 1}</span>}
                  </span>
                  <span className="flex-1">{s.title}</span>
                  {isSaving && isCurrent && <Spinner size="sm" className="ml-2 text-blue-600" />}
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}


