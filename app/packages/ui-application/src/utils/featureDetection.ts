export type SaveCapability = 'filePicker' | 'download';

export function isSecure(): boolean {
  // In browsers, file system access requires secure context
  return typeof window !== 'undefined' && Boolean((window as any).isSecureContext);
}

export function hasFilePicker(): boolean {
  return typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function';
}

export function getSaveCapability(): SaveCapability {
  if (isSecure() && hasFilePicker()) return 'filePicker';
  return 'download';
}


