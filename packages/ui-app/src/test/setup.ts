import { vi } from 'vitest';
import '@testing-library/jest-dom';

// JSDOM global mocks for File System Access API
Object.defineProperty(window, 'showSaveFilePicker', {
  writable: true,
  value: undefined
});

Object.defineProperty(window, 'isSecureContext', {
  writable: true,
  value: true
});

// Mock URL APIs used by download fallback
if (!('createObjectURL' in URL)) {
  // @ts-ignore
  URL.createObjectURL = vi.fn(() => 'blob:mock');
}
// @ts-ignore
URL.revokeObjectURL = vi.fn();


