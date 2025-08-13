export {};

declare global {
  interface Window {
    showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
  }

  interface SaveFilePickerType {
    description: string;
    accept: Record<string, readonly string[]>;
  }

  interface SaveFilePickerOptions {
    suggestedName?: string;
    types?: readonly SaveFilePickerType[];
    startIn?: any;
    excludeAcceptAllOption?: boolean;
  }

  interface FileSystemWritableFileStream {
    write(data: string | Blob | ArrayBufferView): Promise<void>;
    close(): Promise<void>;
  }

  interface FileSystemFileHandle {
    createWritable(): Promise<FileSystemWritableFileStream>;
  }
}


