import React from 'react';

type NodeProps = {
  label: string;
  value: any;
  depth: number;
  defaultOpenDepth: number;
};

function isPlainObject(v: any) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

function formatScalar(v: any): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (v === null || v === undefined) return String(v);
  return JSON.stringify(v);
}

function Node({ label, value, depth, defaultOpenDepth }: NodeProps) {
  const isContainer = isPlainObject(value) || Array.isArray(value);
  const defaultOpen = depth < defaultOpenDepth;
  const [open, setOpen] = React.useState(defaultOpen);

  if (!isContainer) {
    return (
      <div className="pl-3 py-0.5">
        <span className="text-slate-700">{label}:</span>
        <span className="ml-1 text-slate-900 break-all">{formatScalar(value)}</span>
      </div>
    );
  }

  const entries: Array<[string, any]> = Array.isArray(value)
    ? value.map((v, i) => [String(i), v])
    : Object.entries(value);

  return (
    <div className="pl-2">
      <button
        type="button"
        className="flex items-center gap-1 text-left text-slate-800 hover:text-slate-900 py-0.5"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="inline-flex items-center justify-center w-4 h-4 ring-1 ring-slate-300 rounded text-xs select-none">
          {open ? '−' : '+'}
        </span>
        <span className="font-medium">{label}</span>
        <span className="text-slate-500 text-xs">{Array.isArray(value) ? ` [${value.length}]` : ''}</span>
      </button>
      {open && (
        <div className="border-l border-slate-200 ml-2">
          {entries.length === 0 ? (
            <div className="pl-3 py-0.5 text-slate-500 text-xs">(empty)</div>
          ) : (
            entries.map(([k, v]) => (
              <Node key={k} label={k} value={v} depth={depth + 1} defaultOpenDepth={defaultOpenDepth} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function JsonExplorer({ title, data, defaultOpenDepth = 1 }: { title?: string; data: any; defaultOpenDepth?: number }) {
  return (
    <div className="rounded-xl bg-white ring-1 ring-slate-200">
      {title && <div className="px-4 py-2 border-b border-slate-200 text-sm font-semibold text-slate-900">{title}</div>}
      <div className="px-3 py-2 text-sm">
        {isPlainObject(data) || Array.isArray(data) ? (
          <Node label={title ?? 'root'} value={data} depth={0} defaultOpenDepth={defaultOpenDepth} />
        ) : (
          <div className="text-slate-700">No data</div>
        )}
      </div>
    </div>
  );
}


