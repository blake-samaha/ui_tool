export const FILE_TYPES = {
  markdown: {
    description: 'Markdown files',
    accept: { 'text/markdown': ['.md', '.markdown'] }
  }
} as const;

export const DEFAULTS = {
  extension: '.md',
  contentType: 'text/markdown;charset=utf-8'
} as const;

export const MESSAGES = {
  savedPicker: 'Saved via file picker.',
  savedDownload: 'Saved a copy via browser download.',
  cancelled: 'Save cancelled.',
  needSecure: 'Saving requires a secure context (HTTPS or localhost).',
  unsupported: 'Saving is not supported in this browser.'
} as const;


