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
  // New structure: projects/<project>/modules/<module>
  const project = 'example_project';
  const module = 'example_module';
  const base = path.join(pt, 'projects', project, 'modules', module);
  mkdirp(path.join(base, 'XX_Object_Specs'));
  mkdirp(path.join(base, 'ui-state', 'xx'));
  const tier00 = path.join(pt, '00_Solution_Design_Principles.yaml');
  if (!fs.existsSync(tier00)) fs.writeFileSync(tier00, 'schemaVersion: 1\nprojectId: ' + project + '\nmoduleId: ' + module + '\n', 'utf8');
  console.log('Initialized project_templates at', pt);
}

main();

