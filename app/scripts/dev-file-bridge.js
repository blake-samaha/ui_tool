#!/usr/bin/env node
/*
 Minimal dev file-bridge for local testing.
 Usage: node scripts/dev-file-bridge.js --root /abs/path/to/repo --port 45678
*/
const http = require('http');
const url = require('url');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const cp = require('child_process');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { root: '', port: 45678 };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--root') out.root = args[++i];
    else if (args[i] === '--port') out.port = Number(args[++i]);
  }
  if (!out.root) {
    console.error('Missing --root. Example: node scripts/dev-file-bridge.js --root $(pwd) --port 45678');
    process.exit(1);
  }
  out.root = path.resolve(out.root);
  out.allow = path.resolve(out.root, 'project_templates');
  return out;
}

function allowPath(root, allow, relPath) {
  const target = path.resolve(root, relPath.replace(/^\/*/, ''));
  if (!target.startsWith(allow)) {
    const err = new Error('Path not allowed');
    err.status = 403;
    throw err;
  }
  return target;
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(res, code, obj) {
  setCORS(res);
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

async function main() {
  const cfg = parseArgs();
  const server = http.createServer(async (req, res) => {
    try {
      const parsed = url.parse(req.url, true);
      const pathname = parsed.pathname || '';
      // CORS preflight
      setCORS(res);
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
      }
      if (req.method === 'POST' && pathname === '/v1/set-root') {
        const body = JSON.parse((await readBody(req)) || '{}');
        const newRoot = body.root;
        if (!newRoot || typeof newRoot !== 'string') return json(res, 400, { error: 'root is required' });
        const resolved = path.resolve(newRoot);
        cfg.root = resolved;
        cfg.allow = path.resolve(resolved, 'project_templates');
        return json(res, 200, { ok: true, root: cfg.root, allow: cfg.allow });
      }
      if (req.method === 'GET' && pathname === '/v1/health') {
        return json(res, 200, { status: 'ok' });
      }
      if (req.method === 'GET' && pathname === '/v1/read') {
        const rel = parsed.query.path;
        if (!rel) return json(res, 400, { error: 'path is required' });
        const target = allowPath(cfg.root, cfg.allow, String(rel));
        try {
          const text = await fsp.readFile(target, 'utf8');
          setCORS(res);
          res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end(text);
        } catch (e) {
          // Gracefully handle missing files to avoid noisy errors during first-run
          if (e && typeof e === 'object' && (e).code === 'ENOENT') {
            setCORS(res);
            res.writeHead(204); // No Content
            return res.end();
          }
          throw e;
        }
      }
      if (req.method === 'GET' && pathname === '/v1/list') {
        const rel = parsed.query.path;
        if (!rel) return json(res, 400, { error: 'path is required' });
        const target = allowPath(cfg.root, cfg.allow, String(rel));
        try {
          const entries = await fsp.readdir(target, { withFileTypes: true });
          const items = entries.map((d) => ({
            name: d.name,
            path: path.join(rel, d.name).replace(/\\/g, '/'),
            type: d.isDirectory() ? 'dir' : 'file'
          }));
          return json(res, 200, { items });
        } catch (e) {
          if (e && typeof e === 'object' && (e).code === 'ENOENT') {
            return json(res, 200, { items: [] });
          }
          throw e;
        }
      }
      if (req.method === 'POST' && pathname === '/v1/write') {
        const body = JSON.parse(await readBody(req) || '{}');
        const rel = body.path;
        const content = body.content ?? '';
        if (!rel) return json(res, 400, { error: 'path is required' });
        const target = allowPath(cfg.root, cfg.allow, String(rel));
        await fsp.mkdir(path.dirname(target), { recursive: true });
        await fsp.writeFile(target, String(content).endsWith('\n') ? content : content + '\n', 'utf8');
        return json(res, 200, { ok: true });
      }
      if (req.method === 'POST' && pathname === '/v1/mkdirp') {
        const body = JSON.parse(await readBody(req) || '{}');
        const rel = body.path;
        if (!rel) return json(res, 400, { error: 'path is required' });
        const target = allowPath(cfg.root, cfg.allow, String(rel));
        await fsp.mkdir(target, { recursive: true });
        return json(res, 200, { ok: true });
      }
      if (req.method === 'POST' && pathname === '/v1/pick-root') {
        if (process.platform === 'darwin') {
          try {
            const script = 'POSIX path of (choose folder with prompt "Select project root")';
            const out = cp.execFileSync('osascript', ['-e', script], { encoding: 'utf8' });
            const selected = out.trim().replace(/\/$/, '');
            if (!selected) return json(res, 400, { error: 'no_selection' });
            return json(res, 200, { root: selected });
          } catch (e) {
            return json(res, 500, { error: String(e.message || e) });
          }
        }
        return json(res, 501, { error: 'picker_not_supported_on_platform' });
      }
      json(res, 404, { error: 'not_found' });
    } catch (err) {
      const code = err.status || 500;
      json(res, code, { error: String(err.message || err) });
    }
  });
  server.listen(cfg.port, () => {
    console.log(`dev-file-bridge listening on http://127.0.0.1:${cfg.port} (root=${cfg.root})`);
    console.log(`Allowed subtree: ${cfg.allow}`);
  });
}

main();

