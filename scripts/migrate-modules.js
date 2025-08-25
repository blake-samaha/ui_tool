#!/usr/bin/env node
/*
 Migrates legacy project_templates/modules/<module> to
 project_templates/projects/<project>/modules/<module>
 Usage: node scripts/migrate-modules.js /abs/path/to/repo <projectId>
*/
const fs = require('fs');
const path = require('path');

function mkdirp(p) { fs.mkdirSync(p, { recursive: true }); }

function moveDir(src, dst) {
  mkdirp(dst);
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dst, entry);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) moveDir(s, d); else fs.renameSync(s, d);
  }
}

function main() {
  const root = process.argv[2];
  const projectId = process.argv[3];
  if (!root || !projectId) {
    console.error('Usage: node scripts/migrate-modules.js /abs/path/to/repo <projectId>');
    process.exit(1);
  }
  const pt = path.join(root, 'project_templates');
  const legacyModules = path.join(pt, 'modules');
  if (!fs.existsSync(legacyModules)) {
    console.log('No legacy modules folder found, nothing to migrate.');
    return;
  }
  const modules = fs.readdirSync(legacyModules).filter((n) => fs.statSync(path.join(legacyModules, n)).isDirectory());
  if (modules.length === 0) {
    console.log('No modules to migrate.');
    return;
  }
  for (const m of modules) {
    const src = path.join(legacyModules, m);
    const dst = path.join(pt, 'projects', projectId, 'modules', m);
    console.log(`Migrating ${src} -> ${dst}`);
    moveDir(src, dst);
  }
  // Remove empty legacy directory
  try { fs.rmdirSync(legacyModules, { recursive: true }); } catch {}
  console.log('Migration complete.');
}

main();


