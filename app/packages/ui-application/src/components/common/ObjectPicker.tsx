import React from 'react';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';
import { ProjectContext } from '../../state/ProjectContext.js';

export type ObjectRef = { moduleId: string; objectId: string; yamlPath: string; uiStatePath: string };

export function ObjectPicker({ moduleId, onPick }: { moduleId: string; onPick: (obj: ObjectRef | null) => void }) {
  const ctx = React.useContext(ProjectContext);
  if (!ctx) return null;
  const { settings } = ctx;
  const client = React.useMemo(() => new FileBridgeClient({ baseUrl: settings.bridgeBaseUrl }), [settings.bridgeBaseUrl]);
  const [objects, setObjects] = React.useState<ObjectRef[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [newObjectId, setNewObjectId] = React.useState('');
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    (async () => {
      setError(null);
      if (!settings.projectRoot || !moduleId) { setObjects([]); return; }
      try {
        const base = `project_templates/modules/${moduleId}/XX_Object_Specs`;
        const list = await client.list(base);
        const files = list.filter((i) => i.type === 'file' && i.name.endsWith('.yaml'));
        const out: ObjectRef[] = files.map((f) => {
          const objectId = f.name.replace(/\.yaml$/i, '');
          return {
            moduleId,
            objectId,
            yamlPath: `${base}/${f.name}`,
            uiStatePath: `project_templates/modules/${moduleId}/ui-state/xx/${objectId}.json`
          };
        });
        setObjects(out);
      } catch (e: any) {
        setError(String(e?.message ?? e));
        setObjects([]);
      }
    })();
  }, [settings.projectRoot, client, moduleId]);

  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Select an Object</h3>
          <p className="text-sm text-slate-600">Each object has its own Tier XX specification linked to Tier 00 and its module’s Tier 01.</p>
        </div>
        {!creating ? (
          <button
            className="px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50"
            onClick={() => setCreating(true)}
          >
            New object…
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              className="rounded-md px-3 py-2 ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-500/40 outline-none"
              placeholder="lowerCamelCase object id"
              value={newObjectId}
              onChange={(e) => setNewObjectId(e.target.value)}
            />
            <button
              className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={!/^[a-z][A-Za-z0-9]*$/.test(newObjectId)}
              onClick={async () => {
                const oid = newObjectId.trim();
                if (!oid) return;
                const base = `project_templates/modules/${moduleId}`;
                try {
                  await client.mkdirp(`${base}/XX_Object_Specs`);
                  await client.mkdirp(`${base}/ui-state/xx`);
                  setCreating(false);
                  setNewObjectId('');
                  onPick({ moduleId, objectId: oid, yamlPath: `${base}/XX_Object_Specs/${oid}.yaml`, uiStatePath: `${base}/ui-state/xx/${oid}.json` });
                } catch (e: any) {
                  setError(String(e?.message ?? e));
                }
              }}
            >
              Create
            </button>
            <button className="px-3 py-1.5 rounded-md ring-1 ring-slate-300" onClick={() => { setCreating(false); setNewObjectId(''); }}>Cancel</button>
          </div>
        )}
      </div>
      <div className="mt-3 space-y-3">
        {error && <div className="text-sm text-red-700">{error}</div>}
        <div className="max-w-sm">
          <input
            className="w-full rounded-md px-3 py-2 ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-500/40 outline-none"
            placeholder="Search objects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {objects === null ? (
          <div className="text-sm text-slate-600">Loading…</div>
        ) : objects.length === 0 ? (
          <div className="text-sm text-slate-700">No Tier XX objects found for this module. Create a new one.</div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {objects.filter((o) => o.objectId.includes(query)).map((o) => (
              <li key={o.objectId}>
                <button
                  className="w-full text-left rounded-lg p-4 ring-1 ring-slate-200 hover:bg-slate-50"
                  onClick={() => onPick(o)}
                >
                  <div className="font-medium">{o.objectId}</div>
                  <div className="text-xs text-slate-600">{o.yamlPath}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


