import React from 'react';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';
import { ProjectContext } from '../../state/ProjectContext.js';
import { ListPicker } from './ListPicker.js';

export function ProjectPicker({ onPick }: { onPick: (projectId: string | null) => void }) {
  const ctx = React.useContext(ProjectContext);
  if (!ctx) return null;
  const { settings } = ctx;
  const client = React.useMemo(() => new FileBridgeClient({ baseUrl: settings.bridgeBaseUrl }), [settings.bridgeBaseUrl]);
  return (
    <ListPicker
      title="Select a Project"
      load={async () => {
        const entries = await client.list('project_templates/projects');
        return entries.filter((e) => e.type === 'dir').map((e) => ({ id: e.name, label: e.name }));
      }}
      onPick={(it) => onPick(it.id)}
      searchPlaceholder="Search projects…"
    />
  );
}


