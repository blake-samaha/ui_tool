#!/usr/bin/env node
/*
 Runs UI dev server and local file-bridge together with consolidated logs.
 Usage:
   node scripts/dev-runner.js [--root /abs/path/to/repo] [--port 45678]

 Defaults:
   --root defaults to current working directory
   --port defaults to 45678
*/
const { spawn } = require('child_process');
const path = require('path');

function parseArgs() {
  const out = { root: process.cwd(), port: 45678, verbose: true };
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--root') out.root = args[++i];
    else if (args[i] === '--port') out.port = Number(args[++i]);
    else if (args[i] === '--verbose') out.verbose = true;
    else if (args[i] === '--no-verbose') out.verbose = false;
  }
  return out;
}

function color(code) {
  return (s) => `\x1b[${code}m${s}\x1b[0m`;
}
const CYAN = color('36');
const MAGENTA = color('35');
const GRAY = color('90');

function prefixStream(child, label, labelColor) {
  let buf = '';
  const flush = (line) => {
    if (line === '') return;
    const ts = new Date().toISOString().split('T')[1].replace('Z', '');
    process.stdout.write(`${GRAY(ts)} ${labelColor(`[${label}]`)} ${line}\n`);
  };
  const onData = (chunk) => {
    buf += chunk.toString();
    const parts = buf.split(/\r?\n/);
    buf = parts.pop() || '';
    for (const p of parts) flush(p);
  };
  child.stdout.on('data', onData);
  child.stderr.on('data', onData);
}

function spawnProc(cmd, args, opts) {
  const env = { ...process.env };
  if (opts && opts.verboseFlag) {
    if (!('VERBOSE' in env)) env.VERBOSE = '1';
    if (!('VITE_VERBOSE' in env)) env.VITE_VERBOSE = '1';
  }
  const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], env, ...opts });
  p.on('exit', (code, signal) => {
    const why = signal ? `signal ${signal}` : `code ${code}`;
    process.stdout.write(`${GRAY(new Date().toISOString())} ${MAGENTA('[runner]')} ${cmd} exited (${why})\n`);
  });
  return p;
}

async function main() {
  const cfg = parseArgs();
  const appRoot = path.resolve(__dirname, '..');

  // Start file-bridge
  const bridge = spawnProc(
    'node',
    ['scripts/dev-file-bridge.js', '--root', cfg.root, '--port', String(cfg.port)],
    { cwd: appRoot, verboseFlag: cfg.verbose }
  );
  prefixStream(bridge, 'bridge', MAGENTA);

  // Start UI dev server
  const web = spawnProc('pnpm', ['--filter', 'ui-app', 'dev'], { cwd: appRoot, verboseFlag: cfg.verbose });
  prefixStream(web, 'web', CYAN);

  const shutdown = () => {
    web.kill('SIGINT');
    bridge.kill('SIGINT');
    // Small delay to let children exit
    setTimeout(() => process.exit(0), 200);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main();

