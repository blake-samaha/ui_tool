import React from 'react';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';
import { ProjectContext } from '../../state/ProjectContext.js';
import { ListPicker, type ListItem } from './ListPicker.js';

export type ModuleRef = { projectId: string; moduleId: string; path: string };

export function ModulePicker({ onPick, projectId }: { onPick: (module: ModuleRef | null) => void; projectId?: string }) {
  const ctx = React.useContext(ProjectContext);
  if (!ctx) return null;
  const { settings } = ctx;
  const client = React.useMemo(() => new FileBridgeClient({ baseUrl: settings.bridgeBaseUrl }), [settings.bridgeBaseUrl]);
  const load = React.useCallback(async (): Promise<ListItem[]> => {
    if (!settings.projectRoot) return [];
    try { await client.setRoot(settings.projectRoot); } catch {}
    if (projectId) {
      const base = `project_templates/projects/${projectId}/modules`;
      try { await client.mkdirp(base); } catch {}
      const list = await client.list(base);
      return list.filter((i) => i.type === 'dir').map((d) => ({ id: `${projectId}:${d.name}`, label: `${projectId} / ${d.name}`, subtitle: `${base}/${d.name}` }));
    }
    const projectsBase = `project_templates/projects`;
    try { await client.mkdirp(projectsBase); } catch {}
    const projs = await client.list(projectsBase);
    const out: ListItem[] = [];
    for (const p of projs.filter((e) => e.type === 'dir')) {
      const base = `${projectsBase}/${p.name}/modules`;
      try { await client.mkdirp(base); } catch {}
      const mods = await client.list(base);
      out.push(...mods.filter((m) => m.type === 'dir').map((m) => ({ id: `${p.name}:${m.name}`, label: `${p.name} / ${m.name}`, subtitle: `${base}/${m.name}` })));
    }
    return out;
  }, [client, projectId, settings.projectRoot]);

  return (
    <ListPicker
      title="Select a Module"
      subtitle="Each module has its own Tier 01 data model and related Tier XX specs."
      load={load}
      onPick={(it) => {
        const parts = it.id.split(':');
        const proj: string = parts[0] ?? '';
        const mod: string = parts[1] ?? '';
        onPick({ projectId: proj, moduleId: mod, path: it.subtitle ?? '' });
      }}
      canCreate={Boolean(projectId)}
      validateNewId={(id) => /^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(id)}
      create={async (id) => {
        const proj = projectId!;
        const base = `project_templates/projects/${proj}/modules/${id}`;
        await client.mkdirp(`${base}/XX_Object_Specs`);
        await client.mkdirp(`${base}/ui-state/xx`);
      }}
      createPlaceholder="snake_case module id"
      searchPlaceholder="Search modules…"
    />
  );
}


