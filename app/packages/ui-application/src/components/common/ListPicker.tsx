import React from 'react';

export type ListItem = { id: string; label: string; subtitle?: string };

export function ListPicker({
  title,
  subtitle,
  load,
  onPick,
  canCreate = false,
  validateNewId,
  create,
  createPlaceholder = 'enter id',
  searchPlaceholder = 'Search…'
}: {
  title: string;
  subtitle?: string;
  load: () => Promise<ListItem[]>;
  onPick: (item: ListItem) => void;
  canCreate?: boolean;
  validateNewId?: (id: string) => boolean;
  create?: (id: string) => Promise<void>;
  createPlaceholder?: string;
  searchPlaceholder?: string;
}) {
  const [items, setItems] = React.useState<ListItem[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');
  const [creating, setCreating] = React.useState(false);
  const [newId, setNewId] = React.useState('');

  React.useEffect(() => {
    (async () => {
      setError(null);
      try {
        const next = await load();
        setItems(next);
      } catch (e: any) {
        setError(String(e?.message ?? e));
        setItems([]);
      }
    })();
  }, [load]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items || [];
    return (items || []).filter((i) => i.label.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
        </div>
        {canCreate && !creating && create && (
          <button className="px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50" onClick={() => setCreating(true)}>
            New…
          </button>
        )}
        {canCreate && creating && create && (
          <div className="flex items-center gap-2">
            <input className="rounded-md px-3 py-2 ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-500/40 outline-none" placeholder={createPlaceholder} value={newId} onChange={(e) => setNewId(e.target.value)} />
            <button
              className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={validateNewId ? !validateNewId(newId) : newId.trim().length === 0}
              onClick={async () => {
                const id = newId.trim();
                if (!id) return;
                try {
                  await create(id);
                  setCreating(false);
                  setNewId('');
                  // Reload list after creation
                  const next = await load();
                  setItems(next);
                } catch (e: any) {
                  setError(String(e?.message ?? e));
                }
              }}
            >
              Create
            </button>
            <button className="px-3 py-1.5 rounded-md ring-1 ring-slate-300" onClick={() => { setCreating(false); setNewId(''); }}>
              Cancel
            </button>
          </div>
        )}
      </div>
      <div className="mt-3 space-y-3">
        {error && <div className="text-sm text-red-700">{error}</div>}
        <div className="max-w-sm">
          <input className="w-full rounded-md px-3 py-2 ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-500/40 outline-none" placeholder={searchPlaceholder} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {items === null ? (
          <div className="text-sm text-slate-600">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-slate-700">No items.</div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((it) => (
              <li key={it.id}>
                <button className="w-full text-left rounded-lg p-4 ring-1 ring-slate-200 hover:bg-slate-50" onClick={() => onPick(it)}>
                  <div className="font-medium">{it.label}</div>
                  {it.subtitle && <div className="text-xs text-slate-600">{it.subtitle}</div>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


