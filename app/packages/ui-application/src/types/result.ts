export type ErrorCode =
  | 'ABORTED'
  | 'UNSUPPORTED'
  | 'SECURE_CONTEXT_REQUIRED'
  | 'WRITE_FAILED'
  | 'UNKNOWN';

export type Result<T> = { ok: true; value: T } | { ok: false; error: { code: ErrorCode; message: string } };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<T = never>(code: ErrorCode, message: string): Result<T> {
  return { ok: false, error: { code, message } };
}


