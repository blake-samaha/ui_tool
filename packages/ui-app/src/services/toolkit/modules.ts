import { FileBridgeClient } from '@docs-as-code/file-bridge-client';

export async function addModulesIfNeeded(client: FileBridgeClient, _repoRoot: string, modules: string[], createSubdirs = true): Promise<{ ok: string[]; failed: Array<{ name: string; stderr: string }> }> {
  const ok: string[] = [];
  const failed: Array<{ name: string; stderr: string }> = [];
  if (!Array.isArray(modules) || modules.length === 0) return { ok, failed };
  for (const name of modules) {
    const moduleRoot = `modules/${name}`;
    let added = false;
    try {
      await client.mkdirp(moduleRoot);
      added = true;
    } catch (e) {
      failed.push({ name, stderr: String((e as any)?.message || e) });
      continue;
    }
    if (createSubdirs) {
      const subdirs = ['spaces','containers','views','transformations','raw','functions','datasets','auth'];
      for (const sd of subdirs) {
        try {
          await client.mkdirp(`${moduleRoot}/${sd}`);
          await client.write(`${moduleRoot}/${sd}/.gitkeep`, '');
        } catch {}
      }
      // seed a README to encourage documentation of custom modules per Toolkit guidance
      try {
        const readme = `# ${name}\n\nCustom module scaffold. See Cognite Toolkit custom modules guidance for structure and naming.\n`;
        await client.write(`${moduleRoot}/README.md`, readme);
      } catch {}
    }
    if (added) ok.push(name);
  }
  return { ok, failed };
}

export async function writeModuleToml(client: FileBridgeClient, moduleName: string, tags?: string[]): Promise<void> {
  const file = `modules/${moduleName}/module.toml`;
  let title = moduleName;
  try {
    const current = await client.read(file);
    const m = current.match(/title\s*=\s*"([^"]+)"/);
    if (m && m[1]) title = m[1];
  } catch {}
  const lines: string[] = [];
  lines.push('[module]');
  lines.push(`title = "${title}"`);
  if (tags && tags.length > 0) {
    lines.push('');
    lines.push('[packages]');
    const escaped = tags.map((t) => t.replace(/"/g, ''));
    lines.push(`tags = [${escaped.map((t) => `"${t}"`).join(', ')}]`);
  }
  lines.push('');
  await client.write(file, lines.join('\n'));
}


