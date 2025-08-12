import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectContext } from '../state/ProjectContext.js';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';

export function Home() {
  const navigate = useNavigate();
  const ctx = React.useContext(ProjectContext);
  if (!ctx) return null;
  const { settings, setSettings } = ctx;
  const [health, setHealth] = React.useState<'unknown' | 'ok' | 'error'>('unknown');
  const [initMsg, setInitMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    const client = new FileBridgeClient({ baseUrl: settings.bridgeBaseUrl });
    let mounted = true;
    client
      .health()
      .then((ok) => mounted && setHealth(ok ? 'ok' : 'error'))
      .catch(() => mounted && setHealth('error'));
    return () => {
      mounted = false;
    };
  }, [settings.bridgeBaseUrl]);

  // Keep dev bridge root in sync so the UI can work with any local repo
  React.useEffect(() => {
    if (!settings.projectRoot) return;
    const client = new FileBridgeClient({ baseUrl: settings.bridgeBaseUrl });
    client.setRoot(settings.projectRoot).catch(() => {/* noop in dev if bridge doesn't support */});
  }, [settings.projectRoot, settings.bridgeBaseUrl]);

  async function initProjectTemplates() {
    try {
      const client = new FileBridgeClient({ baseUrl: settings.bridgeBaseUrl });
      const base = `project_templates`;
      await client.mkdirp(`${base}/ui-state`);
      setInitMsg('Initialized project_templates under selected root.');
    } catch (e: any) {
      setInitMsg(String(e?.message ?? e));
    }
  }

  function start() {
    navigate('/tier00?step=project-overview');
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 ring-1 ring-slate-200">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Cognite Docs-as-Code</h1>
        <p className="mt-2 text-slate-700">Schema-driven wizard to author requirements templates (00 / 01 / XX) and emit deterministic YAML under your selected repository root.</p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm font-medium text-slate-800">Repository root</span>
            <input
              className="rounded-md px-3 py-2 ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-500/40 outline-none bg-white"
              placeholder="/abs/path/to/repository"
              value={settings.projectRoot}
              onChange={(e) => setSettings({ ...settings, projectRoot: e.target.value })}
            />
          </label>
          <div className="text-sm flex items-center gap-2">
            <div className={health === 'ok' ? 'text-green-700' : health === 'error' ? 'text-red-700' : 'text-gray-500'}>
              Bridge: {health}
            </div>
            <button
              className="px-3 py-2 rounded-md ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
              onClick={async () => {
                const client = new FileBridgeClient({ baseUrl: settings.bridgeBaseUrl });
                const picked = await client.pickRoot();
                if (picked) setSettings({ ...settings, projectRoot: picked });
              }}
              disabled={health !== 'ok'}
            >
              Browse…
            </button>
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <button
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={start}
            disabled={!settings.projectRoot || health !== 'ok'}
          >
            Start Wizard
          </button>
          <button
            className="px-3 py-2 rounded-md ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
            onClick={initProjectTemplates}
            disabled={!settings.projectRoot || health !== 'ok'}
          >
            Initialize project templates
          </button>
        </div>
        {initMsg && <div className="mt-2 text-sm text-slate-700">{initMsg}</div>}
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold text-slate-900">What you will do</h2>
        <ul className="list-disc pl-6 text-slate-800">
          <li>Select a repository root and initialize project templates</li>
          <li>Complete Tier 00 → Tier 01 → Tier XX in a guided wizard</li>
          <li>Review and export YAML and UI-state JSON</li>
        </ul>
      </div>
    </div>
  );
}


