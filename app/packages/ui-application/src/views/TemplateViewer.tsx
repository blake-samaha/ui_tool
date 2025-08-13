import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@docs-as-code/ui-components';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ProjectContext } from '../state/ProjectContext.js';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';
import { generateFilename, saveFile } from '../utils/fileUtils.js';

// Import markdown at build time as raw text. This works in dev and prod bundles.
// Paths are relative to this file: packages/ui-application/src/views
import t00 from '@docs-md/00_Solution_Design_Principles.md?raw';
import t01 from '@docs-md/01_CONCEPTUAL_MODEL_TEMPLATE.md?raw';
import tXX from '@docs-md/XX_Object_Specification_Template.md?raw';

const files: Record<string, { title: string; content: string }> = {
  'solution-design': { title: '00 — Solution Design Principles', content: t00 },
  'conceptual-model': { title: '01 — Conceptual Model', content: t01 },
  'object-specification': { title: 'XX — Object Specification', content: tXX }
};

export function TemplateViewer() {
  const params = useParams();
  const id = params.id || '';
  const meta = files[id];

  const ctx = React.useContext(ProjectContext);
  const [editing, setEditing] = React.useState(false);
  const [text, setText] = React.useState(meta?.content ?? '');
  const [fileName, setFileName] = React.useState<string>('my_template.md');
  const [status, setStatus] = React.useState<string | null>(null);
  const [showMeta, setShowMeta] = React.useState(false);

  if (!meta || !ctx) {
    return <div className="text-sm text-slate-700">Unknown template.</div>;
  }

  // Split optional YAML front matter for view mode (keep it in edit mode)
  function splitFrontmatter(src: string): { front: string; body: string } {
    if (!src.startsWith('---')) return { front: '', body: src };
    const match = src.match(/^---[\r\n]+([\s\S]*?)[\r\n]+---[\r\n]*/);
    if (!match) return { front: '', body: src };
    const front = match[1] ?? '';
    const body = src.slice(match[0].length);
    return { front, body };
  }

  const { front, body } = splitFrontmatter(text);
  const markedHtml = marked.parse(showMeta ? text : body) as string;
  const rendered = DOMPurify.sanitize(markedHtml);

  const isInvalidName = !fileName.trim();

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{meta.title}</h1>
        {!editing ? (
          <div className="flex items-center gap-2">
            {front && (
              <Button variant="ghost" onClick={() => setShowMeta((v) => !v)}>{showMeta ? 'Hide metadata' : 'Show metadata'}</Button>
            )}
            <Button onClick={() => { setEditing(true); setText(meta.content); setStatus(null); }}>Edit</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Save as... (browser download picker) */}
            <Button disabled={isInvalidName} aria-disabled={isInvalidName} onClick={async () => {
              setStatus(null);
              const filename = generateFilename(fileName || 'my_template.md', ctx.settings.projectRoot);
              const result = await saveFile(text, filename);
              if (result.ok) {
                setStatus(result.value.method === 'filePicker' ? 'Saved via file picker.' : 'Saved a copy via browser download.');
              } else if (result.error.code !== 'ABORTED') {
                setStatus(result.error.message);
              }
            }}>Save as…</Button>

            {/* Optional: save to repository under project_templates/docs with timestamp to avoid overwrite */}
            <Button variant="ghost" onClick={async () => {
              setStatus(null);
              const { settings } = ctx;
              if (!settings.projectRoot) { setStatus('Select a repository in the header first.'); return; }
              try {
                const client = new FileBridgeClient({ baseUrl: settings.bridgeBaseUrl });
                const base = 'project_templates/docs';
                await client.mkdirp(base);
                const safe = (fileName || 'my_template.md').replace(/\s+/g, '_');
                const stamped = `${Date.now()}_${/\.md$/i.test(safe) ? safe : safe + '.md'}`;
                const target = `${base}/${stamped}`;
                await client.write(target, text);
                setStatus(`Saved to ${target}`);
              } catch (e: any) {
                setStatus(String(e?.message ?? e));
              }
            }}>Save to repository</Button>

            <Button variant="ghost" className="bg-red-600 text-white hover:bg-red-700" onClick={() => { setEditing(false); setStatus(null); }}>Cancel</Button>
            <div className="ml-2 text-sm text-slate-700">Save name:</div>
            <input aria-label="Save name" aria-invalid={isInvalidName} value={fileName} onChange={(e) => setFileName(e.target.value)} className="rounded px-2 py-1 ring-1 ring-slate-300" />
          </div>
        )}
      </div>
      {status && <div className="text-sm text-slate-700">{status}</div>}
      {!editing ? (
        <div
          className="prose-dark max-w-none rounded-xl bg-slate-900 p-5 ring-1 ring-slate-800 overflow-auto"
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
      ) : (
        <textarea
          className="w-full rounded-xl bg-slate-900 text-slate-100 p-5 ring-1 ring-slate-800 leading-6 text-sm min-h-[60vh] font-mono caret-sky-400"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      )}
    </div>
  );
}


