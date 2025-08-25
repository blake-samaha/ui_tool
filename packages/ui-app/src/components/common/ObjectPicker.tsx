import React from 'react';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';
import { ProjectContext } from '../../state/ProjectContext.js';
import { ListPicker, type ListItem } from './ListPicker.js';

export type ObjectRef = { projectId: string; moduleId: string; objectId: string; yamlPath: string; uiStatePath: string };

export function ObjectPicker({ projectId, moduleId, onPick }: { projectId: string; moduleId: string; onPick: (obj: ObjectRef | null) => void }) {
  const ctx = React.useContext(ProjectContext);
  if (!ctx) return null;
  const { settings } = ctx;
  const client = React.useMemo(() => new FileBridgeClient({ baseUrl: settings.bridgeBaseUrl }), [settings.bridgeBaseUrl]);
  const load = React.useCallback(async (): Promise<ListItem[]> => {
    if (!settings.projectRoot || !moduleId) return [];
    const base = `project_templates/projects/${projectId}/modules/${moduleId}/XX_Object_Specs`;
    const list = await client.list(base);
    const files = list.filter((i) => i.type === 'file' && i.name.endsWith('.yaml'));
    return files.map((f) => ({ id: f.name.replace(/\.yaml$/i, ''), label: f.name.replace(/\.yaml$/i, ''), subtitle: `${base}/${f.name}` }));
  }, [client, moduleId, projectId, settings.projectRoot]);

  return (
    <ListPicker
      title="Select an Object"
      subtitle="Each object has its own Tier XX specification linked to Tier 00 and its module’s Tier 01."
      load={load}
      onPick={(it) => onPick({ projectId, moduleId, objectId: it.id, yamlPath: it.subtitle || '', uiStatePath: `project_templates/projects/${projectId}/modules/${moduleId}/ui-state/xx/${it.id}.json` })}
      canCreate
      validateNewId={(id) => /^[a-z][A-Za-z0-9]*$/.test(id)}
      create={async (_id) => {
        const base = `project_templates/projects/${projectId}/modules/${moduleId}`;
        await client.mkdirp(`${base}/XX_Object_Specs`);
        await client.mkdirp(`${base}/ui-state/xx`);
      }}
      createPlaceholder="lowerCamelCase object id"
      searchPlaceholder="Search objects…"
    />
  );
}


