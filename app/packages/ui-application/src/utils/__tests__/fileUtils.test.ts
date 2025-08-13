import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateFilename, saveFile } from '../fileUtils.js';

describe('fileUtils', () => {
  beforeEach(() => {
    // reset mocks
    (window as any).showSaveFilePicker = undefined;
    (window as any).isSecureContext = true;
  });

  it('generates filename with project suffix, handling backslashes', () => {
    expect(generateFilename('My File', 'C\\proj\\demo')).toMatch(/My_File_demo\.md$/);
    expect(generateFilename('My File', '/home/user/myproj')).toMatch(/My_File_myproj\.md$/);
  });

  it('falls back to download when file picker unavailable', async () => {
    const anchorSpy = vi.spyOn(document, 'createElement');
    anchorSpy.mockImplementation(((tag: string) => {
      const a = document.createElementNS('http://www.w3.org/1999/xhtml', tag);
      // @ts-ignore
      a.click = vi.fn();
      return a as any;
    }) as any);

    const res = await saveFile('content', 'file.md');
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.method).toBe('download');
  });

  it('uses file picker when available', async () => {
    const writable = { write: vi.fn().mockResolvedValue(undefined), close: vi.fn().mockResolvedValue(undefined) };
    (window as any).showSaveFilePicker = vi.fn().mockResolvedValue({ createWritable: () => Promise.resolve(writable) });

    const res = await saveFile('content', 'file.md');
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.method).toBe('filePicker');
  });
});


