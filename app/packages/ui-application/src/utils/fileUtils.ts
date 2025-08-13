import { FILE_TYPES, DEFAULTS, MESSAGES } from '../config/fileConfig.js';
import { getSaveCapability } from './featureDetection.js';
import { sanitizeFilename, extractProjectName } from './filenameUtils.js';
import { Result, ok, err } from '../types/result.js';
import { normalizeSaveError } from './errorUtils.js';

/**
 * Generates a filename with project context if available
 */
export function generateFilename(baseName: string, projectRoot?: string): string {
  const clean = sanitizeFilename(baseName, DEFAULTS.extension);
  const projectName = extractProjectName(projectRoot);
  if (!projectName) return clean;
  const nameWithoutExt = clean.replace(/\.md$/i, '');
  return `${nameWithoutExt}_${projectName}${DEFAULTS.extension}`;
}

/**
 * Saves content to a file using the best available method
 */
export async function saveFile(content: string, filename: string): Promise<Result<{ method: 'filePicker' | 'download' }>> {
  try {
    const capability = getSaveCapability();
    const safeName = sanitizeFilename(filename, DEFAULTS.extension);

    if (capability === 'filePicker' && window.showSaveFilePicker) {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: safeName,
        types: [FILE_TYPES.markdown],
        excludeAcceptAllOption: true
      });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      return ok({ method: 'filePicker' });
    }

    const blob = new Blob([content], { type: DEFAULTS.contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = safeName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return ok({ method: 'download' });
  } catch (e) {
    return normalizeSaveError(e);
  }
}
