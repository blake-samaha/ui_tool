import React from 'react';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';

export type BridgeHealth = 'unknown' | 'ok' | 'error';

export function useFileBridgeHealth(baseUrl: string): BridgeHealth {
  const [health, setHealth] = React.useState<BridgeHealth>('unknown');
  React.useEffect(() => {
    const client = new FileBridgeClient({ baseUrl });
    let mounted = true;
    client
      .health()
      .then((ok) => mounted && setHealth(ok ? 'ok' : 'error'))
      .catch(() => mounted && setHealth('error'));
    return () => { mounted = false; };
  }, [baseUrl]);
  return health;
}


