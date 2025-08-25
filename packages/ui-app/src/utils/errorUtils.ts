import { Result, err } from '../types/result.js';

export function normalizeSaveError(e: unknown): Result<never> {
  if (isAbortError(e)) return err('ABORTED', 'Save cancelled.');
  if (isSecureContextError(e)) return err('SECURE_CONTEXT_REQUIRED', 'Saving requires a secure context (HTTPS or localhost).');
  if (isUnsupportedError(e)) return err('UNSUPPORTED', 'Saving is not supported in this browser.');
  return err('UNKNOWN', `Save failed: ${getErrorMessage(e)}`);
}

export function getErrorMessage(e: unknown): string {
  if (typeof e === 'string') return e;
  if (e && typeof e === 'object' && 'message' in e && typeof (e as any).message === 'string') return (e as any).message;
  try { return JSON.stringify(e); } catch { return String(e); }
}

export function isAbortError(e: unknown): boolean {
  return Boolean(e && typeof e === 'object' && (e as any).name === 'AbortError');
}

export function isSecureContextError(_e: unknown): boolean {
  // Placeholder hook for future differentiation
  return false;
}

export function isUnsupportedError(_e: unknown): boolean {
  // Placeholder hook for future differentiation
  return false;
}


