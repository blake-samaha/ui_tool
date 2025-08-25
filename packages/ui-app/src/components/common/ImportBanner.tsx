export type ImportBannerProps = {
  open: boolean;
  title?: string;
  message?: string;
  onImport: () => Promise<void> | void;
  onDismiss: () => void;
  isImporting?: boolean;
};

export function ImportBanner({ open, title = 'YAML detected', message = 'A YAML file exists for this scope. You can import it as your starting point or start fresh.', onImport, onDismiss, isImporting = false }: ImportBannerProps) {
  if (!open) return null;
  return (
    <div className="rounded-md bg-amber-50 p-4 ring-1 ring-amber-200 flex items-center justify-between">
      <div className="pr-4">
        <div className="font-medium text-amber-800">{title}</div>
        <div className="text-sm text-amber-700">{message}</div>
      </div>
      <div className="flex gap-2 whitespace-nowrap">
        <button
          type="button"
          disabled={isImporting}
          onClick={() => void onImport()}
          className="px-3 py-1.5 rounded-md bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {isImporting ? 'Importing…' : 'Import from YAML'}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="px-3 py-1.5 rounded-md ring-1 ring-amber-300 bg-white hover:bg-amber-100"
        >
          Start fresh
        </button>
      </div>
    </div>
  );
}


