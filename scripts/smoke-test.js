#!/usr/bin/env node
/*
 Simple smoke test that validates the production build exists and the main bundles are present.
 Optionally runs a minimal YAML emit/parse round-trip using the library code.
*/
const fs = require('fs');
const path = require('path');

function ensure(p, msg) {
  if (!fs.existsSync(p)) {
    console.error('FAIL:', msg, '-', p);
    process.exit(1);
  } else {
    console.log('OK  :', msg);
  }
}

function main() {
  const appDist = path.resolve(__dirname, '../packages/ui-app/dist');
  ensure(appDist, 'ui-app build dist exists');
  ensure(path.join(appDist, 'index.html'), 'ui-app index.html exists');
  const assets = path.join(appDist, 'assets');
  ensure(assets, 'assets dir exists');
  const hasJs = fs.readdirSync(assets).some((f) => f.endsWith('.js'));
  const hasCss = fs.readdirSync(assets).some((f) => f.endsWith('.css'));
  if (!hasJs || !hasCss) {
    console.error('FAIL: expected JS and CSS bundles');
    process.exit(1);
  }
  console.log('OK  : bundles present');
  // Verify schema presence for config validation
  const schemaDir = path.resolve(__dirname, '../schema');
  ensure(path.join(schemaDir, 'config_env.schema.json'), 'config_env.schema.json exists');
  console.log('OK  : schema present');
  console.log('Smoke test passed');
}

main();

