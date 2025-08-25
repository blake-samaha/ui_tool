export class FileBridgeClient {
    baseUrl;
    constructor(options) {
        this.baseUrl = options.baseUrl.replace(/\/$/, '');
    }
    async health() {
        try {
            const res = await fetch(`${this.baseUrl}/v1/health`);
            return res.ok;
        }
        catch {
            return false;
        }
    }
    async read(path) {
        const res = await fetch(`${this.baseUrl}/v1/read?path=${encodeURIComponent(path)}`);
        if (res.status === 204 || res.status === 404)
            return '';
        if (!res.ok)
            throw new Error(`Read failed: ${res.status}`);
        return await res.text();
    }
    async write(path, content) {
        const res = await fetch(`${this.baseUrl}/v1/write`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path, content })
        });
        if (!res.ok)
            throw new Error(`Write failed: ${res.status}`);
    }
    async list(path) {
        const res = await fetch(`${this.baseUrl}/v1/list?path=${encodeURIComponent(path)}`);
        if (!res.ok)
            throw new Error(`List failed: ${res.status}`);
        const body = await res.json();
        return (body && body.items) || [];
    }
    async mkdirp(path) {
        const res = await fetch(`${this.baseUrl}/v1/mkdirp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path })
        });
        if (!res.ok)
            throw new Error(`mkdirp failed: ${res.status}`);
    }
    async setRoot(root) {
        const res = await fetch(`${this.baseUrl}/v1/set-root`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ root })
        });
        if (!res.ok)
            throw new Error(`setRoot failed: ${res.status}`);
    }
    async pickRoot() {
        const res = await fetch(`${this.baseUrl}/v1/pick-root`, { method: 'POST' });
        if (!res.ok)
            return null;
        const body = await res.json();
        return (body && body.root) || null;
    }
    async exec(command, cwd) {
        const res = await fetch(`${this.baseUrl}/v1/exec`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command, cwd })
        });
        if (!res.ok)
            throw new Error(`Exec failed: ${res.status}`);
        const body = await res.json();
        if (import.meta?.env?.VITE_VERBOSE) {
            // eslint-disable-next-line no-console
            console.log('[bridge][exec][response]', { command, cwd, ok: body?.ok, code: body?.code });
            if (body?.stdout)
                console.log('[bridge][exec][stdout]', body.stdout);
            if (body?.stderr)
                console.log('[bridge][exec][stderr]', body.stderr);
        }
        return body;
    }
}
