import React from 'react';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';
import { ProjectContext } from '../../state/ProjectContext.js';

export type ModuleRef = { moduleId: string; path: string };

export function ModulePicker({ onPick }: { onPick: (module: ModuleRef | null) => void }) {
  const ctx = React.useContext(ProjectContext);
  if (!ctx) return null;
  const { settings } = ctx;
  const client = React.useMemo(() => new FileBridgeClient({ baseUrl: settings.bridgeBaseUrl }), [settings.bridgeBaseUrl]);
  const [modules, setModules] = React.useState<ModuleRef[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');
  const [creating, setCreating] = React.useState(false);
  const [newModuleId, setNewModuleId] = React.useState('');

  React.useEffect(() => {
    (async () => {
      setError(null);
      if (!settings.projectRoot) { setModules([]); return; }
      try {
        const base = 'project_templates/modules';
        const list = await client.list(base);
        const dirs = list.filter((i) => i.type === 'dir');
        const out: ModuleRef[] = dirs.map((d) => ({ moduleId: d.name, path: `${base}/${d.name}` }));
        setModules(out);
      } catch (e: any) {
        setError(String(e?.message ?? e));
        setModules([]);
      }
    })();
  }, [settings.projectRoot, client]);

  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Select a Module</h3>
          <p className="text-sm text-slate-600">Each module has its own Tier 01 data model and related Tier XX specs.</p>
        </div>
        {!creating ? (
          <button
            className="px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50"
            onClick={() => setCreating(true)}
          >
            New module…
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              className="rounded-md px-3 py-2 ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-500/40 outline-none"
              placeholder="snake_case module id"
              value={newModuleId}
              onChange={(e) => setNewModuleId(e.target.value)}
            />
            <button
              className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={!/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(newModuleId)}
              onClick={async () => {
                const m = newModuleId.trim();
                if (!m) return;
                const base = `project_templates/modules/${m}`;
                try {
                  await client.mkdirp(`${base}/XX_Object_Specs`);
                  await client.mkdirp(`${base}/ui-state/xx`);
                  setCreating(false);
                  setNewModuleId('');
                  onPick({ moduleId: m, path: base });
                } catch (e: any) {
                  setError(String(e?.message ?? e));
                }
              }}
            >
              Create
            </button>
            <button className="px-3 py-1.5 rounded-md ring-1 ring-slate-300" onClick={() => { setCreating(false); setNewModuleId(''); }}>Cancel</button>
          </div>
        )}
      </div>
      <div className="mt-3 space-y-3">
        {error && <div className="text-sm text-red-700">{error}</div>}
        <div className="max-w-sm">
          <input
            className="w-full rounded-md px-3 py-2 ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-500/40 outline-none"
            placeholder="Search modules…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {modules === null ? (
          <div className="text-sm text-slate-600">Loading…</div>
        ) : modules.length === 0 ? (
          <div className="text-sm text-slate-700">No Tier 01 modules found. Create a new one to get started.</div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {modules.filter((m) => m.moduleId.includes(query)).map((m) => (
              <li key={m.moduleId}>
                <button
                  className="w-full text-left rounded-lg p-4 ring-1 ring-slate-200 hover:bg-slate-50"
                  onClick={() => onPick(m)}
                >
                  <div className="font-medium">{m.moduleId}</div>
                  <div className="text-xs text-slate-600">{m.path}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


