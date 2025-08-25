import React from 'react';
import type { FileBridgeClient } from '@docs-as-code/file-bridge-client';

export function useModuleNames(client: FileBridgeClient) {
  const [modules, setModules] = React.useState<string[]>([]);
  React.useEffect(() => {
    (async () => {
      try {
        const list = await client.list('modules');
        const names = list.filter((e) => e.type === 'dir').map((e) => e.name);
        setModules(names);
      } catch {}
    })();
  }, [client]);
  return modules;
}


