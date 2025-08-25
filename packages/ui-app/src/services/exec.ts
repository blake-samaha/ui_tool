import type { FileBridgeClient } from '@docs-as-code/file-bridge-client';

export type ExecResult = { ok: boolean; stdout?: string; stderr?: string; code?: number };

export function isVerbose(): boolean {
  try {
    const env = (import.meta as any)?.env as Record<string, string> | undefined;
    if (env && typeof env.VITE_VERBOSE !== 'undefined') {
      return env.VITE_VERBOSE === '1' || String(env.VITE_VERBOSE).toLowerCase() === 'true';
    }
  } catch {}
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const v = window.localStorage.getItem('verbose') || window.localStorage.getItem('debug');
      if (v) return v === '1' || v.toLowerCase() === 'true';
    }
  } catch {}
  return false;
}

export function dbg(...args: any[]): void {
  if (isVerbose()) {
     
    console.log('[debug]', ...args);
  }
}

export async function execVerbose(client: FileBridgeClient, command: string, cwd = '.'): Promise<ExecResult> {
  const verbose = isVerbose();
  if (verbose) {
     
    console.info('[exec][run]', { command, cwd });
  }
  const res = await client.exec(command, cwd);
  if (verbose) {
    if (!res.ok) {
       
      console.error('[exec][fail]', { command, cwd, code: res.code, stderr: res.stderr || '', stdout: res.stdout || '' });
    } else {
      if (res.stderr) {
         
        console.warn('[exec][stderr]', { command, cwd, stderr: res.stderr });
      }
      if (res.stdout) {
         
        console.info('[exec][stdout]', { command, cwd, stdout: res.stdout });
      }
    }
  }
  return res as ExecResult;
}


