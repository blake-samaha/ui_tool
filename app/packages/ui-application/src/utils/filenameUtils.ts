const INVALID_CHARS = /[\u0000-\u001F\u007F<>:"/\\|?*]/g; // Windows reserved + control chars

export function sanitizeFilename(name: string, extension = '.md'): string {
  const trimmed = name.trim();
  const replaced = trimmed.replace(/\s+/g, '_').replace(INVALID_CHARS, '_');
  if (/\.[A-Za-z0-9]+$/.test(replaced)) return replaced;
  return replaced + extension;
}

export function extractProjectName(projectRoot?: string): string | undefined {
  if (!projectRoot) return undefined;
  const parts = projectRoot.split(/[/\\]+/); // handle / and \ separators
  const last = parts[parts.length - 1];
  return last || undefined;
}


