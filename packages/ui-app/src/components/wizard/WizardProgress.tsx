export function WizardProgress({ phase, completedCount, totalSteps }: { phase?: 'phase1' | 'phase2' | 'phase2x' | 'phase3' | 'phase4'; completedCount: number; totalSteps: number; }) {
  const progressPercentage = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-700">Overall Progress</span>
        <span className="text-sm text-slate-600">{completedCount} of {totalSteps} steps completed</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
        <div className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }} />
      </div>
      <ol className="flex items-center justify-between gap-2 text-sm">
        {[
          { id: 'phase1', label: '1. Foundation' },
          { id: 'phase2', label: '2. Model Design' },
          { id: 'phase2x', label: '2X. Object Specs' },
          { id: 'phase3', label: '3. Data Consumption' },
          { id: 'phase4', label: '4. Governance & Ops' }
        ].map((p) => (
          <li key={p.id} className={`flex-1 text-center px-2 py-1 rounded-md ring-1 ${phase === (p.id as any) ? 'bg-blue-50 text-blue-700 ring-blue-200' : 'bg-white text-slate-700 ring-slate-200'}`}>
            {p.label}
          </li>
        ))}
      </ol>
    </div>
  );
}


