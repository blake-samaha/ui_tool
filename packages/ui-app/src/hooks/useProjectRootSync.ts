import React from 'react';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';

export function useProjectRootSync(projectRoot: string | undefined, bridgeBaseUrl: string) {
  React.useEffect(() => {
    if (!projectRoot) return;
    const client = new FileBridgeClient({ baseUrl: bridgeBaseUrl });
    client.setRoot(projectRoot).catch(() => {});
  }, [projectRoot, bridgeBaseUrl]);
}


