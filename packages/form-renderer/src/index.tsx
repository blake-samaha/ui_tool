import React from 'react';
import { InfoTooltip, TextInput, TextArea, NumberInput, Select, Checkbox } from '@docs-as-code/ui-components';
import { MultiSelect as MultiSelectControl } from './components/MultiSelect';
import { ArrayOfStringsRow as ArrayOfStringsRowControl } from './components/ArrayOfStringsRow';
import { useForm, FormProvider, useFormContext, useFieldArray, useFormState, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

type VisibleWhen = {
    path: string; // supports '../' to go up, '$' prefix for absolute
    equals?: string | number | boolean;
    in?: Array<string | number | boolean>;
};

export type UIControlField = {
    kind: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'directory' | 'multiselect';
    id: string;
    label: string;
    options?: Array<{ value: string; label: string; group?: string; help?: string }>;
    /**
     * Dynamically derive options from a path in the form data.
     * Accepts either an array of strings, or an array of objects.
     * - If array of strings: each string becomes { value, label }
     * - If array of objects: tries to use 'name' then 'label' then 'value' field as both value and label
     * The path supports '../' to go up and '$' prefix for absolute.
     */
    optionsFromPath?: string;
    /**
     * When the field is empty, prefill it once from another path in the form.
     * The path supports '../' and '$' (absolute) resolution.
     */
    prefillFromPath?: string;
    /**
     * Show clickable suggestions fetched from other form paths.
     * Each suggestion may optionally provide a label for clarity in the UI.
     */
    suggestFrom?: Array<{ path: string; label?: string }>;
    help?: string; // tooltip/help text describing the field and example usage
    placeholder?: string; // optional placeholder for inputs
    maxLength?: number; // optional max length constraint for text/textarea inputs
    visibleWhen?: VisibleWhen | VisibleWhen[];
    readonly?: boolean; // if true, field is readonly with placeholder value for security
    secretPlaceholder?: string; // placeholder value for secret fields (e.g., "${CLIENT_ID}")
};

export type UIGroupField = {
    kind: 'group';
    label?: string;
    path?: string;
    fields: UISchemaField[];
    visibleWhen?: VisibleWhen | VisibleWhen[];
};

export type UIArrayField = {
    kind: 'array';
    path: string; // e.g., environments
    label?: string;
    minItems?: number;
    addLabel?: string;
    removeLabel?: string;
    item: UIGroupField; // group of fields for each item
    render?: 'cards' | 'table';
    columns?: string[]; // optional subset of item.fields ids to show as columns in table mode
    pageSize?: number; // optional pagination size for table mode
    actions?: Array<{ label: string; hrefTemplate: string; target?: '_blank' | '_self' }>;
    collapsible?: boolean; // if true, each row renders as a collapsible card
    titleField?: string; // optional field id inside item to show as title
    showIndex?: boolean; // show 1-based index badge per row
    visibleWhen?: VisibleWhen | VisibleWhen[];
    /**
     * Prefill new array items by copying values from other form paths into specific child ids.
     * Example: [{ id: 'cdf_cluster', fromPath: '$.cdf_cluster' }]
     */
    newItemPrefill?: Array<{ id: string; fromPath: string }>;
};

export type UIArrayStringsField = {
    kind: 'arrayOfStrings';
    path: string; // e.g., dataModel.groupedViews
    label?: string;
    addLabel?: string;
    removeLabel?: string;
    help?: string;
    placeholder?: string;
    maxLength?: number;
    visibleWhen?: VisibleWhen | VisibleWhen[];
};

export type UISchemaField = UIControlField | UIGroupField | UIArrayField | UIArrayStringsField;

export type UISchema = { fields: UISchemaField[] };

function joinPath(base: string | undefined, id: string): string {
    return base ? `${base}.${id}` : id;
}

function resolvePath(basePath: string | undefined, relPath: string): string {
    if (!relPath) return basePath || '';
    if (relPath.startsWith('$')) return relPath.slice(1);
    if (!basePath) return relPath.replace(/^\.\//, '');
    let current = basePath.split('.');
    let rel = relPath;
    while (rel.startsWith('../')) {
        rel = rel.slice(3);
        current.pop();
    }
    if (rel.startsWith('./')) rel = rel.slice(2);
    return rel ? `${current.join('.')}.${rel}` : current.join('.');
}

function toSingular(label: string): string {
    const l = label.trim();
    if (/cases$/i.test(l)) return l.replace(/cases$/i, (m) => (m[0] === 'C' ? 'Case' : 'case'));
    if (/ies$/i.test(l)) return l.replace(/ies$/i, (m) => (m[0] === 'I' ? 'Y' : 'y'));
    if (l.endsWith('s')) return l.slice(0, -1);
    return l;
}

// Unified input component using the design system
function UnifiedTextInput({ id, name, placeholder, maxLength, className, readonly, secretPlaceholder }: { 
    id: string; 
    name: string; 
    placeholder?: string; 
    maxLength?: number; 
    className?: string;
    readonly?: boolean;
    secretPlaceholder?: string;
}) {
    const methods = useFormContext();
    
    // For readonly secret fields, set the value to the secret placeholder (only once)
    React.useEffect(() => {
        if (readonly && secretPlaceholder) {
            methods.setValue(name as any, secretPlaceholder, { shouldDirty: false });
        }
    }, [readonly, secretPlaceholder, name]);
    
    if (readonly) {
        return (
            <TextInput
                id={id}
                name={name}
                readonly={true}
                secretPlaceholder={secretPlaceholder}
                className={className}
            />
        );
    }
    
    return (
        <TextInput
            id={id}
            placeholder={placeholder}
            maxLength={maxLength}
            className={className}
            {...methods.register(name as any)}
        />
    );
}

// Unified textarea component using the design system
function UnifiedTextArea({ id, name, placeholder, maxLength, className }: { id: string; name: string; placeholder?: string; maxLength?: number; className?: string }) {
    const methods = useFormContext();
    return (
        <TextArea
            id={id}
            placeholder={placeholder}
            maxLength={maxLength}
            className={className}
            {...methods.register(name as any)}
        />
    );
}

function useIsVisible(field: { visibleWhen?: VisibleWhen | VisibleWhen[] }, basePath?: string): boolean {
    const methods = useFormContext();
    const rules: VisibleWhen[] = Array.isArray(field.visibleWhen)
        ? field.visibleWhen
        : field.visibleWhen
        ? [field.visibleWhen]
        : [];
    if (rules.length === 0) return true;
    return rules.every((rule) => {
        const watchPath = resolvePath(basePath, rule.path);
        const value = methods.watch(watchPath as any);
        if (rule.in) return rule.in.includes(value as any);
        if (Object.prototype.hasOwnProperty.call(rule, 'equals')) return value === rule.equals;
        return Boolean(value);
    });
}

// moved MultiSelect to components/MultiSelect

// Memoized row card to avoid re-rendering unaffected siblings in arrays
const MemoRowCard = React.memo(function MemoRowCard({
    index,
    title,
    collapsible,
    showIndex,
    removeLabel,
    onRemove,
    children
}: {
    index: number;
    title?: string;
    collapsible?: boolean;
    showIndex?: boolean;
    removeLabel?: string;
    onRemove: () => void;
    children: React.ReactNode;
}) {
    const [open, setOpen] = React.useState(true);
    return (
        <div className="rounded-lg p-3 space-y-2 ring-1 ring-slate-200 bg-white">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {showIndex && <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-700">{index + 1}</span>}
                    <span className="font-medium text-slate-900">{title || `Row ${index + 1}`}</span>
                </div>
                <div className="flex items-center gap-2">
                    {collapsible && (
                        <button type="button" className="px-2 py-1 rounded-md ring-1 ring-slate-300 hover:bg-slate-50" onClick={() => setOpen((v) => !v)}>
                            {open ? 'Collapse' : 'Expand'}
                        </button>
                    )}
                    <button type="button" className="px-2 py-1 rounded-md ring-1 ring-red-200 text-red-700 hover:bg-red-50" onClick={onRemove}>
                        {removeLabel ?? 'Remove'}
                    </button>
                </div>
            </div>
            {!collapsible || open ? <>{children}</> : null}
        </div>
    );
});

function ControlField({ field, basePath }: { field: UIControlField; basePath?: string }) {
    const methods = useFormContext();
    const name = joinPath(basePath, field.id);
    // Subscribe to error state for just this field to avoid global formState-driven re-renders
    const { errors } = useFormState({ control: methods.control, name: name as any });
    // Resolve nested error using dotted path
    const errorForField: any = React.useMemo(() => {
        const parts = String(name).split('.');
        let cur: any = errors as any;
        for (const p of parts) {
            if (!cur) return undefined;
            cur = cur[p as any];
        }
        return cur;
    }, [errors, name]);
    const visible = useIsVisible(field, basePath);
    // Compute dynamic options when requested for select/multiselect
    const wantsDynamicOptions = (field.kind === 'select' || field.kind === 'multiselect') && !!field.optionsFromPath;
    const dynamicPath = (field.kind === 'select' || field.kind === 'multiselect') && field.optionsFromPath
        ? resolvePath(basePath, (field.optionsFromPath as string))
        : undefined;
    // Always call hooks in a stable order; when not needed, watch a dummy path
    const rawDynamicOptions: any = useWatch({ control: methods.control, name: (dynamicPath ?? '__unused__') as any });
    const computedOptions = React.useMemo(() => {
        if (!wantsDynamicOptions) return field.options ?? [];
        const arr = Array.isArray(rawDynamicOptions) ? rawDynamicOptions : [];
        const toOpt = (v: any) => {
            if (typeof v === 'string') return { value: v, label: v };
            if (v && typeof v === 'object') {
                // Prefer stable id as value and name as label when available
                const value = v.id ?? v.value ?? v.name ?? v.label;
                const label = v.name ?? v.label ?? v.id ?? v.value;
                if (value !== undefined && label !== undefined) return { value: String(value), label: String(label) };
            }
            return undefined;
        };
        const mapped = arr.map(toOpt).filter(Boolean) as Array<{ value: string; label: string }>;
        return mapped;
    }, [wantsDynamicOptions, rawDynamicOptions, field.options]);

    // One-time prefill support
    const wantsPrefill = !!field.prefillFromPath && (field.kind === 'text' || field.kind === 'textarea' || field.kind === 'select' || field.kind === 'number');
    const prefillPath = field.prefillFromPath ? resolvePath(basePath, field.prefillFromPath as string) : undefined;
    // Always call hooks in a stable order; when not needed, watch a dummy path
    const prefillValue: any = useWatch({ control: methods.control, name: (prefillPath ?? '__unused__') as any });
    const didPrefillRef = React.useRef(false);
    React.useEffect(() => {
        if (!wantsPrefill || didPrefillRef.current) return;
        const cur = methods.getValues(name as any) as any;
        const isEmpty = cur === undefined || cur === null || (typeof cur === 'string' && cur.trim().length === 0);
        const hasSource = prefillValue !== undefined && prefillValue !== null && (!(typeof prefillValue === 'string') || prefillValue.trim().length > 0);
        if (isEmpty && hasSource) {
            let value: any = prefillValue;
            // Support CDM template fan-out: if source is space:externalId@version, fill children fields when ids match
            try {
                if (typeof prefillValue === 'string' && (name.endsWith('.space') || name.endsWith('.externalId') || name.endsWith('.version'))) {
                    const base = name.replace(/\.(space|externalId|version)$/,'');
                    const src = methods.getValues((prefillPath as any)) as string;
                    const [left, ver] = String(src || '').split('@');
                    const [space, externalId] = String(left || '').split(':');
                    if (name.endsWith('.space') && space) value = space;
                    if (name.endsWith('.externalId') && externalId) value = externalId;
                    if (name.endsWith('.version') && ver) value = ver;
                }
            } catch {}
            methods.setValue(name as any, value as any, { shouldDirty: false, shouldTouch: true, shouldValidate: true });
            didPrefillRef.current = true;
        }
    }, [wantsPrefill, prefillValue, name, methods]);

    // Suggestions pulled from other paths
    const suggestions: Array<{ label?: string; value: any }> = React.useMemo(() => {
        const items: Array<{ label?: string; value: any }> = [];
        const srcs = Array.isArray(field.suggestFrom) ? field.suggestFrom : [];
        for (const s of srcs) {
            const abs = resolvePath(basePath, s.path);
            const v = methods.watch(abs as any);
            const has = v !== undefined && v !== null && (!(typeof v === 'string') || String(v).trim().length > 0);
            if (has) items.push({ label: s.label, value: v });
        }
        return items;
    }, [field.suggestFrom, basePath, methods]);

    if (!visible) return null;
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium flex items-center gap-2 text-slate-900" htmlFor={name}>
                <span>{field.label}</span>
                {field.readonly && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800">
                        🔒 Protected
                    </span>
                )}
                {field.help && (
                    <InfoTooltip
                        definition={field.readonly 
                            ? `${field.help} This field is protected for security - actual values should be set in your .env file.`
                            : field.help
                        }
                        example={field.placeholder}
                        label={`Help: ${field.label}`}
                        className="text-slate-600"
                    />
                )}
            </label>
            {field.kind === 'text' && (
                <UnifiedTextInput 
                    id={name} 
                    name={name} 
                    placeholder={field.placeholder} 
                    maxLength={field.maxLength} 
                    readonly={field.readonly}
                    secretPlaceholder={field.secretPlaceholder}
                />
            )}
            {suggestions.length > 0 && (
                <div className="-mt-1 mb-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span>Suggestions:</span>
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            type="button"
                            className="rounded-md px-2 py-0.5 ring-1 ring-slate-300 hover:bg-slate-50"
                            onClick={() => methods.setValue(name as any, s.value, { shouldDirty: true, shouldTouch: true, shouldValidate: true })}
                            aria-label={s.label ? `Use ${s.label}` : 'Use suggested value'}
                        >
                            {s.label ? `${s.label}: ` : ''}<span className="font-medium text-slate-800">{String(s.value)}</span>
                        </button>
                    ))}
                </div>
            )}
            {field.kind === 'directory' && <DirectoryControl id={name} placeholder={field.placeholder} />}
            {field.kind === 'textarea' && <UnifiedTextArea id={name} name={name} placeholder={field.placeholder} maxLength={field.maxLength} />}
            {field.kind === 'select' && (
                <Select id={name} {...methods.register(name as any)}>
                    {/* Provide an empty option to avoid implicit selection when options are dynamic */}
                    <option value=""></option>
                    {(computedOptions && computedOptions.length > 0 ? computedOptions : field.options ?? []).map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </Select>
            )}
            {field.kind === 'multiselect' && (
                <MultiSelectControl id={name} options={(computedOptions && computedOptions.length > 0 ? computedOptions : field.options ?? [])} placeholder={field.placeholder} />
            )}
            {field.kind === 'checkbox' && (
                <Checkbox id={name} {...methods.register(name as any)} />
            )}
            {field.kind === 'number' && (
                <NumberInput 
                    id={name} 
                    placeholder={field.placeholder}
                    {...methods.register(name as any, { valueAsNumber: true })} 
                />
            )}
            {errorForField?.message && <p className="text-sm text-red-600">{String(errorForField.message)}</p>}
        </div>
    );
}

function DirectoryControl({ id, placeholder }: { id: string; placeholder?: string }) {
    const methods = useFormContext();
    const onPick = (methods as any)._onDirectoryPick as undefined | (() => Promise<string | undefined>);
    async function browse() {
        if (!onPick) return;
        const picked = await onPick();
        if (picked) methods.setValue(id as any, picked, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    }
    return (
        <div className="flex items-center gap-2">
            <TextInput 
                id={id} 
                placeholder={placeholder} 
                className="flex-1" 
                {...methods.register(id as any)} 
            />
            <button type="button" className="rounded-md px-3 py-2 text-sm ring-1 ring-slate-300 hover:bg-slate-50" onClick={browse} aria-label="Browse for directory">
                Browse…
            </button>
        </div>
    );
}

function GroupField({ field, basePath }: { field: UIGroupField; basePath?: string }) {
    const newBase = field.path ? joinPath(basePath, field.path) : basePath;
    const visible = useIsVisible(field, basePath);
    if (!visible) return null;
    return (
        <div className="space-y-2">
            {field.label && <div className="font-medium">{field.label}</div>}
            {field.fields.map((child, idx) => {
                const key = (child as any).id || (child as any).path || idx;
                return <RenderField key={key} field={child} basePath={newBase} />;
            })}
        </div>
    );
}

function ArrayField({ field, basePath }: { field: UIArrayField; basePath?: string }) {
    const methods = useFormContext();
    const path = joinPath(basePath, field.path);
    const fa = useFieldArray({ control: methods.control, name: path as any });
    const visible = useIsVisible(field, basePath);
    if (!visible) return null;
    if (field.render === 'table') {
        return <TableArrayField field={field} basePath={basePath} />;
    }
    function toSingular(label: string): string {
        const l = label.trim();
        // Special-case common plural 'cases' -> 'Case'
        if (/cases$/i.test(l)) return l.replace(/cases$/i, (m) => (m[0] === 'C' ? 'Case' : 'case'));
        if (l.endsWith('s')) return l.slice(0, -1);
        return l;
    }
    const removeAt = React.useCallback((i: number) => fa.remove(i), [fa]);
    function setDeep(obj: any, dotted: string, value: any) {
        const parts = String(dotted).split('.').filter(Boolean);
        if (parts.length === 0) return;
        let cur: any = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            const p = parts[i];
            if (!p) continue;
            if (!cur[p] || typeof cur[p] !== 'object') cur[p] = {};
            cur = cur[p];
        }
        const last = parts[parts.length - 1];
        if (last) cur[last] = value;
    }

    function computeNewItemPrefill(): any {
        if (!field.newItemPrefill || field.newItemPrefill.length === 0) return {};
        const initial: any = {};
        for (const m of field.newItemPrefill) {
            const sourcePath = resolvePath(basePath, m.fromPath);
            const v = methods.getValues(sourcePath as any);
            if (v !== undefined && v !== null && (!(typeof v === 'string') || v.trim().length > 0)) {
                setDeep(initial, m.id, v);
            }
        }
        return initial;
    }

    return (
        <div className="space-y-2">
            {field.label && <div className="font-medium">{field.label}</div>}
            {fa.fields.map((f, idx) => {
                const rowBase = `${path}.${idx}`;
                // Avoid reading form values for title to prevent re-render side effects during typing
                const title = undefined as string | undefined;
                return (
                    <MemoRowCard
                        key={`${f.id}-${idx}`}
                        index={idx}
                        title={title ?? `${toSingular(field.label ?? 'Row')} ${idx + 1}`}
                        collapsible={field.collapsible}
                        showIndex={field.showIndex}
                        removeLabel={field.removeLabel}
                        onRemove={() => removeAt(idx)}
                    >
                        <GroupField field={field.item} basePath={rowBase} />
                    </MemoRowCard>
                );
            })}
            <button
                type="button"
                className="px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50"
                onClick={() => fa.append(computeNewItemPrefill()) as any}
            >
                {field.addLabel ?? `Add ${toSingular(field.label ?? 'Item')}`}
            </button>
        </div>
    );
}

function ArrayOfStringsField({ field, basePath }: { field: UIArrayStringsField; basePath?: string }) {
    const methods = useFormContext();
    const path = joinPath(basePath, field.path);
    const visible = useIsVisible(field, basePath);
    const fa = useFieldArray({ control: methods.control, name: path as any });
    if (!visible) return null;

    return (
        <div className="space-y-2 rounded-xl bg-white p-4 ring-1 ring-slate-200">
            {field.label && (
                <div className="font-medium text-slate-900 flex items-center gap-2">
                    <span>{field.label}</span>
                    {field.help && (
                        <InfoTooltip
                            definition={field.help}
                            example={field.placeholder}
                            label={`Help: ${field.label}`}
                            className="text-slate-600"
                        />
                    )}
                </div>
            )}
            {fa.fields.map((f, idx) => (
                <ArrayOfStringsRowControl
                    key={f.id}
                    name={`${path}.${idx}`}
                    index={idx}
                    onRemove={() => fa.remove(idx)}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    removeLabel={field.removeLabel}
                />
            ))}
            <button
                type="button"
                className="px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50"
                onClick={() => {
                    const nextIndex = fa.fields.length;
                    fa.append('' as any);
                    // Focus the newly added input for faster entry
                    setTimeout(() => {
                        try { (methods as any).setFocus?.(`${path}.${nextIndex}`); } catch {}
                    }, 0);
                }}
                aria-label={field.addLabel ?? 'Add'}
            >
                {field.addLabel ?? `Add ${toSingular(field.label ?? 'Item').replace(/s$/,'')}`}
            </button>
        </div>
    );
}

// moved ArrayOfStringsRow to components/ArrayOfStringsRow

function ControlInput({ field, name }: { field: UIControlField; name: string }) {
    const methods = useFormContext();
    
    if (field.kind === 'text') {
        return (
            <TextInput
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                readonly={field.readonly}
                secretPlaceholder={field.secretPlaceholder}
                className="px-2 py-1" // Compact styling for table cells
                {...methods.register(name as any)}
            />
        );
    }
    
    if (field.kind === 'textarea') {
        return (
            <TextArea
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                rows={2}
                className="px-2 py-1" // Compact styling for table cells
                {...methods.register(name as any)}
            />
        );
    }
    
    if (field.kind === 'select') {
        return (
            <Select className="px-2 py-1" {...methods.register(name as any)}>
                {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </Select>
        );
    }
    
    if (field.kind === 'multiselect') {
        return <MultiSelectControl id={name} options={field.options ?? []} placeholder={field.placeholder} />;
    }
    
    if (field.kind === 'checkbox') {
        return <Checkbox {...methods.register(name as any)} />;
    }
    
    if (field.kind === 'number') {
        return (
            <NumberInput 
                placeholder={field.placeholder}
                className="px-2 py-1" // Compact styling for table cells
                {...methods.register(name as any, { valueAsNumber: true })} 
            />
        );
    }
    
    return null;
}

function TableArrayField({ field, basePath }: { field: UIArrayField; basePath?: string }) {
    const methods = useFormContext();
    const path = joinPath(basePath, field.path);
    const fa = useFieldArray({ control: methods.control, name: path as any });
    const allColumns = (field.item.fields.filter((f: any) => f.kind !== 'group' && f.kind !== 'array' && f.kind !== 'arrayOfStrings') as UIControlField[]).map((f) => f.id);
    const columnIds = field.columns && field.columns.length > 0 ? field.columns : allColumns;
    const columns = (field.item.fields as UISchemaField[]).filter((f) => (f as any).id && columnIds.includes((f as any).id)) as UIControlField[];
    const pageSize = field.pageSize ?? 25;
    const [limit, setLimit] = React.useState(pageSize);
    const visible = fa.fields.slice(0, limit);

    function applyTemplate(template: string, row: any, root: any): string {
        // Fallbacks: if values are not present in form state, try URL params
        let projectId: string | undefined = root?.projectId;
        let moduleId: string | undefined = root?.moduleId;
        let objectId: string | undefined = row?.objectId;

        try {
            const params = new URL(window.location.href).searchParams;
            if (!projectId) projectId = params.get('projectId') || undefined;
            if (!moduleId) moduleId = params.get('moduleId') || undefined;
            if (!objectId) objectId = params.get('objectId') || undefined;
        } catch {}

        return template
            .replace(/\{\{\s*projectId\s*\}\}/g, String(projectId ?? ''))
            .replace(/\{\{\s*moduleId\s*\}\}/g, String(moduleId ?? ''))
            .replace(/\{\{\s*objectId\s*\}\}/g, String(objectId ?? ''));
    }

    return (
        <div className="space-y-2">
            {field.label && <div className="font-medium">{field.label}</div>}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="text-left text-slate-600">
                            {columns.map((col) => (
                                <th key={col.id} className="px-2 py-1 font-medium">{col.label}</th>
                            ))}
                            <th className="px-2 py-1"></th>
                            {field.actions && field.actions.length > 0 && <th className="px-2 py-1">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map((f, idx) => (
                            <tr key={f.id} className="bg-white even:bg-slate-50">
                                {columns.map((col) => {
                                    const name = `${path}.${idx}.${col.id}`;
                                    return (
                                        <td key={col.id} className="px-2 py-1 align-top">
                                            <ControlInput field={col} name={name} />
                                        </td>
                                    );
                                })}
                                <td className="px-2 py-1 align-top">
                                    <button type="button" className="px-2 py-1 rounded-md ring-1 ring-red-200 text-red-700 hover:bg-red-50" onClick={() => fa.remove(idx)}>
                                        {field.removeLabel ?? 'Remove'}
                                    </button>
                                </td>
                                {field.actions && field.actions.length > 0 && (
                                    <td className="px-2 py-1 align-top whitespace-nowrap">
                                        {field.actions.map((a, i) => {
                                            const row = methods.getValues(`${path}.${idx}` as any);
                                            const root = methods.getValues();
                                            const href = applyTemplate(a.hrefTemplate, row, root);
                                            return (
                                                <a key={i} href={href} target={a.target ?? '_self'} className="inline-flex items-center px-2 py-1 text-blue-700 hover:underline mr-2">
                                                    {a.label}
                                                </a>
                                            );
                                        })}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {limit < fa.fields.length && (
                <button type="button" className="px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50" onClick={() => setLimit((l) => l + pageSize)}>
                    Load more… ({fa.fields.length - limit} remaining)
                </button>
            )}
            <button
                type="button"
                className="px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50"
                onClick={() => fa.append({}) as any}
            >
                {field.addLabel ?? 'Add'}
            </button>
        </div>
    );
}

function RenderField({ field, basePath }: { field: UISchemaField; basePath?: string }) {
    if (field.kind === 'group') return <GroupField field={field} basePath={basePath} />;
    if (field.kind === 'array') return <ArrayField field={field} basePath={basePath} />;
    if (field.kind === 'arrayOfStrings') return <ArrayOfStringsField field={field} basePath={basePath} />;
    return <ControlField field={field} basePath={basePath} />;
}

export type FormRendererHandle<TSchema extends z.ZodTypeAny = any> = {
    resetDirty: () => void;
    resetTo: (values: Partial<z.infer<TSchema>>) => void;
    getValues: () => z.infer<TSchema>;
};

export const FormRenderer = React.forwardRef(function FormRenderer<TSchema extends z.ZodTypeAny>({
    uiSchema,
    defaultValues,
    onSubmit,
    schema,
    hideSubmit,
    onChange,
    onDirectoryPick,
    onDirtyChange,
    externalResetCounter
}: {
    uiSchema: UISchema;
    defaultValues?: Partial<z.infer<TSchema>>;
    onSubmit: (data: z.infer<TSchema>) => void;
    schema?: TSchema;
    hideSubmit?: boolean;
    onChange?: (data: z.infer<TSchema>) => void;
    onDirectoryPick?: () => Promise<string | undefined>;
    onDirtyChange?: (isDirty: boolean) => void;
    externalResetCounter?: number;
}, ref: React.ForwardedRef<FormRendererHandle<TSchema>>) {
    const methods = useForm<z.infer<TSchema>>({
        defaultValues: defaultValues as z.infer<TSchema>,
        resolver: schema ? (zodResolver(schema) as any) : undefined,
        shouldUnregister: false,
        mode: 'onChange',
        reValidateMode: 'onChange'
    });

    // Attach directory pick handler to methods context so DirectoryControl can call it
    (methods as any)._onDirectoryPick = onDirectoryPick;

    React.useEffect(() => {
        if (!onChange) return;
        let frame: any = null;
        const sub = methods.watch((value) => {
            if (frame) cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                onChange(value as any);
                frame = null;
            });
        });
        return () => {
            sub.unsubscribe();
            if (frame) cancelAnimationFrame(frame);
        };
    }, [methods, onChange]);

    // Report dirty-state changes to parent
    React.useEffect(() => {
        if (!onDirtyChange) return;
        onDirtyChange(methods.formState.isDirty);
    }, [methods.formState.isDirty, onDirtyChange]);

    // Allow external reset to clear dirty state without changing values
    React.useEffect(() => {
        if (externalResetCounter === undefined) return;
        // Reset to current values so focus and typing are preserved and only the dirty flag is cleared
        const current = methods.getValues();
        methods.reset(current);
    }, [externalResetCounter]);

    React.useImperativeHandle(ref, () => ({
        resetDirty: () => {
            const current = methods.getValues();
            methods.reset(current);
        },
        resetTo: (values: any) => {
            methods.reset(values as any);
        },
        getValues: () => methods.getValues() as any
    }), [methods]);

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4" autoComplete="off" data-lpignore="true" data-1p-ignore="true">
                {uiSchema.fields.map((f, idx) => (
                    <RenderField key={idx} field={f} />
                ))}
                {!hideSubmit && (
                    <button type="submit" className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Submit
                    </button>
                )}
            </form>
        </FormProvider>
    );
});
