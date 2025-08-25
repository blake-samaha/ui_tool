import { FileBridgeClient } from '@docs-as-code/file-bridge-client';

// Env template generation is no longer needed; we don't write .env files.
export function generateEnvExample(_data: any): string { return ''; }
export async function writeEnvExampleAtRoot(_client: FileBridgeClient, _baseDir: string, _content: string): Promise<void> { /* no-op */ }


