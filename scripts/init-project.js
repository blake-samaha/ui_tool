#!/usr/bin/env node
/*
 Initializes project_templates structure under a provided repo root.
 Usage: node scripts/init-project.js /abs/path/to/repo
*/
const fs = require('fs');
const path = require('path');

function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}

function main() {
  const root = process.argv[2];
  if (!root) {
    console.error('Usage: node scripts/init-project.js /abs/path/to/repo');
    process.exit(1);
  }
  const pt = path.join(root, 'project_templates');
  mkdirp(pt);
  mkdirp(path.join(pt, 'ui-state'));
  // New Tier 00 UI-state only
  const tier00ui = path.join(pt, 'ui-state', '00_toolkit.json');
  if (!fs.existsSync(tier00ui)) fs.writeFileSync(tier00ui, JSON.stringify({ schemaVersion: 1, environments: [{ name: 'dev' }, { name: 'prod' }] }, null, 2) + '\n', 'utf8');
  console.log('Initialized project_templates at', pt);
}

main();

