import { FileBridgeClient } from '@docs-as-code/file-bridge-client';

export function generateModelingContextMarkdownFromParts(input: {
  module: string;
  purpose?: { overview?: string; outcomes?: string[]; successCriteria?: string[]; constraints?: string[] };
  personas?: Array<{ name: string; role?: string; painPoints?: string[] }>;
  problems?: string[];
  objects?: Array<{ name: string; description?: string; implements?: Array<{ space: string; externalId: string; version?: string }> }>;
  relationships?: Array<{ label?: string; from: string | { module: string; object: string }; to: string | { module: string; object: string }; direction?: 'A_TO_B' | 'B_TO_A' | 'BIDIRECTIONAL'; description?: string }>;
}): string {
  const lines: string[] = [];
  lines.push(`# Modeling Context — ${input.module}`);
  lines.push('');
  lines.push('## 1. Purpose and Scope');
  lines.push(`- Overview: ${input.purpose?.overview || ''}`);
  if (input.purpose?.outcomes?.length) { lines.push('- Outcomes (optional):', ...input.purpose.outcomes.map((o) => `  - ${o}`)); }
  if (input.purpose?.successCriteria?.length) { lines.push('- Success Criteria (optional):', ...input.purpose.successCriteria.map((s) => `  - ${s}`)); }
  if (input.purpose?.constraints?.length) { lines.push('- Constraints (optional):', ...input.purpose.constraints.map((c) => `  - ${c}`)); }
  lines.push('');
  lines.push('## 2. Personas');
  if (input.personas?.length) {
    for (const p of input.personas) {
      lines.push(`### ${p.name}${p.role ? ` (optional role: ${p.role})` : ''}`);
      if (p.painPoints?.length) { lines.push('- Pain Points (optional):', ...p.painPoints.map((pp) => `  - ${pp}`)); }
    }
  } else {
    lines.push('-');
  }
  lines.push('');
  lines.push('## 3. Problems to Solve (optional)');
  if (input.problems?.length) lines.push(...input.problems.map((pr) => `- ${pr}`)); else lines.push('-');
  lines.push('');
  lines.push('## 4. Object Inventory');
  if (input.objects?.length) lines.push(...input.objects.map((o) => `- ${o.name}: ${o.description || ''}`)); else lines.push('-');
  lines.push('');
  lines.push('## 5. Implements and Inter-Module Relationships');
  lines.push('### Implements');
  if (input.objects) {
    for (const o of input.objects) {
      if (!o.implements) continue;
      for (const imp of o.implements) lines.push(`- ${o.name} implements ${imp.space}:${imp.externalId}${imp.version ? ` (version ${imp.version})` : ''}`);
    }
  }
  lines.push('');
  lines.push('### Relationships');
  function fmtEndpoint(ep: any): string {
    if (!ep) return '';
    if (typeof ep === 'string') return ep;
    if (typeof ep === 'object' && ep.module && ep.object) return `${ep.module}.${ep.object}`;
    return String(ep);
  }
  if (input.relationships?.length) {
    for (const r of input.relationships) {
      const dirArrow = r.direction === 'B_TO_A' ? '←' : '→';
      const arrow = r.direction === 'BIDIRECTIONAL' ? '↔' : dirArrow;
      const left = fmtEndpoint(r.from);
      const right = fmtEndpoint(r.to);
      lines.push(`- ${r.label || ''}: ${left} ${arrow} ${right} — ${r.description || ''}`.trim());
    }
  }
  lines.push('');
  lines.push('## 6. Notes and Assumptions');
  lines.push('-');
  lines.push('');
  return lines.join('\n');
}

export async function writeMarkdown(client: FileBridgeClient, moduleName: string, filename: string, content: string): Promise<void> {
  const dir = `modules/${moduleName}/docs`;
  const path = `${dir}/${filename}`;
  await client.mkdirp(dir);
  await client.write(path, content.endsWith('\n') ? content : content + '\n');
}


