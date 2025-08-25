const RESERVED_SET = new Set(['<', '>', ':', '"', '/', '\\', '|', '?', '*']);

export function sanitizeFilename(name: string, extension = '.md'): string {
    const trimmed = name.trim();
    let out = '';
    for (let i = 0; i < trimmed.length; i++) {
        const ch = trimmed.charAt(i);
        const code = ch.charCodeAt(0);
        const isControl = code <= 0x1f || code === 0x7f;
        if (isControl || RESERVED_SET.has(ch)) {
            out += '_';
        } else if (ch === ' ') {
            out += '_';
        } else {
            out += ch;
        }
    }
    if (/\.[A-Za-z0-9]+$/.test(out)) return out;
    return out + extension;
}

export function extractProjectName(projectRoot?: string): string | undefined {
    if (!projectRoot) return undefined;
    const parts = projectRoot.split(/[/\\]+/); // handle / and \\ separators
    const last = parts[parts.length - 1];
    return last || undefined;
}


