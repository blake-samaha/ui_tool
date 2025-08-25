import { FileBridgeClient } from '@docs-as-code/file-bridge-client';
import { execVerbose, dbg } from '../exec.js';

export async function resolveCdfPath(client: FileBridgeClient, repoRoot: string): Promise<string> {
  const preVerify = await client.exec('test -x .venv/bin/cdf', repoRoot);
  if (preVerify.ok) {
    dbg('[cdf] pre-verified local cdf exists at repo root');
    return `${repoRoot}/.venv/bin/cdf`;
  }
  console.info('[cdf] Checking uv presence…');
  const uvCheck = await execVerbose(client, 'uv --version', repoRoot);
  if (!uvCheck.ok) {
    throw new Error('uv is required to prepare the repo-local .venv. Install uv: https://docs.astral.sh/uv/');
  }
  console.info('[cdf] Creating/ensuring .venv via uv venv…');
  await execVerbose(client, 'uv venv .venv', repoRoot);
  console.info('[cdf] Installing/Upgrading cognite-toolkit in .venv via uv pip…');
  const pipInstall = await execVerbose(client, 'uv pip install --python .venv/bin/python --upgrade cognite-toolkit', repoRoot);
  if (!pipInstall.ok) {
    console.warn('[cdf] uv pip failed, attempting fallback via venv python -m pip…');
    await execVerbose(client, '.venv/bin/python -m ensurepip --upgrade', repoRoot);
    await execVerbose(client, '.venv/bin/python -m pip install --upgrade pip', repoRoot);
    const pipFallback = await execVerbose(client, '.venv/bin/python -m pip install --upgrade cognite-toolkit', repoRoot);
    if (!pipFallback.ok) {
      throw new Error('[cdf] Install failed (uv and pip).');
    }
  }
  const verify = await execVerbose(client, 'test -x .venv/bin/cdf', repoRoot);
  if (!verify.ok) {
    throw new Error('[cdf] Verification failed: .venv/bin/cdf not found or not executable after install.');
  }
  dbg('[cdf] resolved project root for cdf:', repoRoot);
  return `${repoRoot}/.venv/bin/cdf`;
}


