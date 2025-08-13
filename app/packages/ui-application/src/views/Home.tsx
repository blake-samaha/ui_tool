import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectContext } from '../state/ProjectContext.js';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';
import { Button } from '@docs-as-code/ui-components';
import { Mermaid } from '../components/common/Mermaid.js';

export function Home() {
  const navigate = useNavigate();
  const ctx = React.useContext(ProjectContext);
  if (!ctx) return null;
  const { settings } = ctx;
  const [health, setHealth] = React.useState<'unknown' | 'ok' | 'error'>('unknown');
  const DOCS_URL = 'https://docs.cognitedata.com/';

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

  function start() {
    navigate('/tier00?step=repo-setup');
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl p-10 ring-1 ring-slate-200">
        <div className="relative z-10 grid gap-8 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs ring-1 ring-slate-200 backdrop-blur">
              <span className={`inline-block h-2 w-2 rounded-full ${health === 'ok' ? 'bg-green-600' : health === 'error' ? 'bg-red-600' : 'bg-slate-400'}`} />
              <span className="font-medium text-slate-700">Bridge: {health}</span>
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
              Cognite Docs-as-Code
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-700">
              Author and maintain requirements as code. Use a schema-driven wizard to complete Tier 00 → Tier 01 → Tier XX,
              then export deterministic YAML and UI-state JSON directly into your repository.
            </p>
            {/* Primary CTA moved into the Get started callout for stronger focus */}
          </div>
          <div className="md:pl-10">
            <div className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
              <div className="text-sm font-medium text-slate-900">Get started</div>
              <p className="mt-1 text-sm text-slate-700">Start the wizard to select your repository and we will initialize any missing folders automatically.</p>
              <div className="mt-3">
                <Button
                  onClick={start}
                  disabled={health !== 'ok'}
                  className="px-6 py-3 text-base"
                  aria-label="Start the guided wizard"
                >
                  Start wizard
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* subtle backdrop shapes */}
        <div className="pointer-events-none absolute -right-28 -top-28 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-20 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />
      </section>

      {/* Workflow section (custom, brand-aligned) */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">How it works</h2>
        <div className="rounded-xl bg-white/50 p-5 ring-1 ring-slate-200">
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">1</span>
              <div>
                <div className="font-medium text-slate-900">Frame requirements with Markdown templates</div>
                <div className="text-sm text-slate-700">Use the templates as a shared checklist during discovery, workshops, and sign‑off.</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">2</span>
              <div>
                <div className="font-medium text-slate-900">Capture decisions in Cognite Docs-as-Code</div>
                <div className="text-sm text-slate-700">Guided, validated fields remove ambiguity and keep terminology consistent.</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">3</span>
              <div>
                <div className="font-medium text-slate-900">Generate version‑controlled artifacts</div>
                <div className="text-sm text-slate-700">Deterministic YAML and UI‑state JSON that are both human‑ and LLM‑friendly.</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">4</span>
              <div>
                <div className="font-medium text-slate-900">Deploy changes to Cognite Data Fusion</div>
                <div className="text-sm text-slate-700">Use the AI assistant workflow and Cognite Toolkit to create/update your CDF repository.</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">5</span>
              <div>
                <div className="font-medium text-slate-900">Iterate: refine → regenerate → redeploy</div>
                <div className="text-sm text-slate-700">After the initial deploy, update inputs in the app as you learn, regenerate YAML/JSON, and redeploy with Toolkit. Repeat steps 2–4 until stable.</div>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Quickstart moved to its own page to keep focus on the wizard */}
    </div>
  );
}


