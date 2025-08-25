import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

export function MultiSelect({ id, options, placeholder }: { id: string; options: Array<{ value: string; label: string }>; placeholder?: string }) {
    const methods = useFormContext();
    const current: string[] = useWatch({ control: methods.control, name: id as any }) ?? [];
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    React.useEffect(() => {
        function onDocClick(e: MouseEvent) { if (!containerRef.current) return; if (containerRef.current.contains(e.target as Node)) return; setOpen(false); }
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);
    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q));
    }, [options, query]);
    function toggle(value: string) {
        const set = new Set<string>(Array.isArray(current) ? current : []);
        if (set.has(value)) set.delete(value); else set.add(value);
        methods.setValue(id as any, Array.from(set), { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    }
    const selected = new Set<string>(Array.isArray(current) ? current : []);
    const selectedLabels = React.useMemo(() => {
        if (!Array.isArray(current) || current.length === 0) return [] as string[];
        const map = new Map(options.map(o => [o.value, o.label] as const));
        return current.map(v => map.get(v) || v);
    }, [current, options]);
    const buttonText = selectedLabels.length === 0
        ? (placeholder ?? 'Select...')
        : selectedLabels.length <= 3
            ? selectedLabels.join(', ')
            : `${selectedLabels.length} selected`;
    return (
        <div className="relative inline-block w-full" ref={containerRef}>
            <button type="button" className="w-full rounded-md px-3 py-2 ring-1 ring-slate-300 bg-white text-left hover:bg-slate-50" onClick={() => setOpen((v) => !v)}>
                <span className="text-sm text-slate-900">{buttonText}</span>
            </button>
            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-md bg-white ring-1 ring-slate-200 shadow-lg">
                    <div className="p-2 border-b border-slate-200">
                        <input className="w-full rounded-md px-3 py-2 ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-500/40 outline-none bg-white" placeholder={placeholder ?? 'Search...'} value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
                    </div>
                    <div className="max-h-56 overflow-auto">
                        {filtered.map((opt) => (
                            <label key={opt.value} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer">
                                <input type="checkbox" checked={selected.has(opt.value)} onChange={() => toggle(opt.value)} />
                                <span className="text-sm">{opt.label}</span>
                            </label>
                        ))}
                        {filtered.length === 0 && <div className="px-3 py-2 text-sm text-slate-500">No matches</div>}
                    </div>
                    <div className="p-2 border-t border-slate-200 flex justify-end">
                        <button type="button" className="px-2 py-1 rounded-md ring-1 ring-slate-300 hover:bg-slate-50" onClick={() => setOpen(false)}>Done</button>
                    </div>
                </div>
            )}
        </div>
    );
}


