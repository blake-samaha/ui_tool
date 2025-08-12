import React from 'react';

export function YAMLPreviewPanel({ yaml }: { yaml: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(yaml);
    } catch {}
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">YAML Preview</h3>
        <button className="px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50" onClick={copy}>Copy</button>
      </div>
      <pre className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200 whitespace-pre-wrap leading-5 text-sm max-h-96 overflow-auto">{yaml}</pre>
    </div>
  );
}


