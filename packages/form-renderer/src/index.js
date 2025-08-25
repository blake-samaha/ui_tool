import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { InfoTooltip, TextInput, TextArea, NumberInput, Select, Checkbox } from '@docs-as-code/ui-components';
import { MultiSelect as MultiSelectControl } from './components/MultiSelect';
import { ArrayOfStringsRow as ArrayOfStringsRowControl } from './components/ArrayOfStringsRow';
import { useForm, FormProvider, useFormContext, useFieldArray, useFormState, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
function joinPath(base, id) {
    return base ? `${base}.${id}` : id;
}
function resolvePath(basePath, relPath) {
    if (!relPath)
        return basePath || '';
    if (relPath.startsWith('$'))
        return relPath.slice(1);
    if (!basePath)
        return relPath.replace(/^\.\//, '');
    let current = basePath.split('.');
    let rel = relPath;
    while (rel.startsWith('../')) {
        rel = rel.slice(3);
        current.pop();
    }
    if (rel.startsWith('./'))
        rel = rel.slice(2);
    return rel ? `${current.join('.')}.${rel}` : current.join('.');
}
function toSingular(label) {
    const l = label.trim();
    if (/cases$/i.test(l))
        return l.replace(/cases$/i, (m) => (m[0] === 'C' ? 'Case' : 'case'));
    if (/ies$/i.test(l))
        return l.replace(/ies$/i, (m) => (m[0] === 'I' ? 'Y' : 'y'));
    if (l.endsWith('s'))
        return l.slice(0, -1);
    return l;
}
// Unified input component using the design system
function UnifiedTextInput({ id, name, placeholder, maxLength, className, readonly, secretPlaceholder }) {
    const methods = useFormContext();
    // For readonly secret fields, set the value to the secret placeholder (only once)
    React.useEffect(() => {
        if (readonly && secretPlaceholder) {
            methods.setValue(name, secretPlaceholder, { shouldDirty: false });
        }
    }, [readonly, secretPlaceholder, name]);
    if (readonly) {
        return (_jsx(TextInput, { id: id, name: name, readonly: true, secretPlaceholder: secretPlaceholder, className: className }));
    }
    return (_jsx(TextInput, { id: id, placeholder: placeholder, maxLength: maxLength, className: className, ...methods.register(name) }));
}
// Unified textarea component using the design system
function UnifiedTextArea({ id, name, placeholder, maxLength, className }) {
    const methods = useFormContext();
    return (_jsx(TextArea, { id: id, placeholder: placeholder, maxLength: maxLength, className: className, ...methods.register(name) }));
}
function useIsVisible(field, basePath) {
    const methods = useFormContext();
    const rules = Array.isArray(field.visibleWhen)
        ? field.visibleWhen
        : field.visibleWhen
            ? [field.visibleWhen]
            : [];
    if (rules.length === 0)
        return true;
    return rules.every((rule) => {
        const watchPath = resolvePath(basePath, rule.path);
        const value = methods.watch(watchPath);
        if (rule.in)
            return rule.in.includes(value);
        if (Object.prototype.hasOwnProperty.call(rule, 'equals'))
            return value === rule.equals;
        return Boolean(value);
    });
}
// moved MultiSelect to components/MultiSelect
// Memoized row card to avoid re-rendering unaffected siblings in arrays
const MemoRowCard = React.memo(function MemoRowCard({ index, title, collapsible, showIndex, removeLabel, onRemove, children }) {
    const [open, setOpen] = React.useState(true);
    return (_jsxs("div", { className: "rounded-lg p-3 space-y-2 ring-1 ring-slate-200 bg-white", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [showIndex && _jsx("span", { className: "inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-700", children: index + 1 }), _jsx("span", { className: "font-medium text-slate-900", children: title || `Row ${index + 1}` })] }), _jsxs("div", { className: "flex items-center gap-2", children: [collapsible && (_jsx("button", { type: "button", className: "px-2 py-1 rounded-md ring-1 ring-slate-300 hover:bg-slate-50", onClick: () => setOpen((v) => !v), children: open ? 'Collapse' : 'Expand' })), _jsx("button", { type: "button", className: "px-2 py-1 rounded-md ring-1 ring-red-200 text-red-700 hover:bg-red-50", onClick: onRemove, children: removeLabel ?? 'Remove' })] })] }), !collapsible || open ? _jsx(_Fragment, { children: children }) : null] }));
});
function ControlField({ field, basePath }) {
    const methods = useFormContext();
    const name = joinPath(basePath, field.id);
    // Subscribe to error state for just this field to avoid global formState-driven re-renders
    const { errors } = useFormState({ control: methods.control, name: name });
    // Resolve nested error using dotted path
    const errorForField = React.useMemo(() => {
        const parts = String(name).split('.');
        let cur = errors;
        for (const p of parts) {
            if (!cur)
                return undefined;
            cur = cur[p];
        }
        return cur;
    }, [errors, name]);
    const visible = useIsVisible(field, basePath);
    // Compute dynamic options when requested for select/multiselect
    const wantsDynamicOptions = (field.kind === 'select' || field.kind === 'multiselect') && !!field.optionsFromPath;
    const dynamicPath = (field.kind === 'select' || field.kind === 'multiselect') && field.optionsFromPath
        ? resolvePath(basePath, field.optionsFromPath)
        : undefined;
    // Always call hooks in a stable order; when not needed, watch a dummy path
    const rawDynamicOptions = useWatch({ control: methods.control, name: (dynamicPath ?? '__unused__') });
    const computedOptions = React.useMemo(() => {
        if (!wantsDynamicOptions)
            return field.options ?? [];
        const arr = Array.isArray(rawDynamicOptions) ? rawDynamicOptions : [];
        const toOpt = (v) => {
            if (typeof v === 'string')
                return { value: v, label: v };
            if (v && typeof v === 'object') {
                // Prefer stable id as value and name as label when available
                const value = v.id ?? v.value ?? v.name ?? v.label;
                const label = v.name ?? v.label ?? v.id ?? v.value;
                if (value !== undefined && label !== undefined)
                    return { value: String(value), label: String(label) };
            }
            return undefined;
        };
        const mapped = arr.map(toOpt).filter(Boolean);
        return mapped;
    }, [wantsDynamicOptions, rawDynamicOptions, field.options]);
    // One-time prefill support
    const wantsPrefill = !!field.prefillFromPath && (field.kind === 'text' || field.kind === 'textarea' || field.kind === 'select' || field.kind === 'number');
    const prefillPath = field.prefillFromPath ? resolvePath(basePath, field.prefillFromPath) : undefined;
    // Always call hooks in a stable order; when not needed, watch a dummy path
    const prefillValue = useWatch({ control: methods.control, name: (prefillPath ?? '__unused__') });
    const didPrefillRef = React.useRef(false);
    React.useEffect(() => {
        if (!wantsPrefill || didPrefillRef.current)
            return;
        const cur = methods.getValues(name);
        const isEmpty = cur === undefined || cur === null || (typeof cur === 'string' && cur.trim().length === 0);
        const hasSource = prefillValue !== undefined && prefillValue !== null && (!(typeof prefillValue === 'string') || prefillValue.trim().length > 0);
        if (isEmpty && hasSource) {
            let value = prefillValue;
            // Support CDM template fan-out: if source is space:externalId@version, fill children fields when ids match
            try {
                if (typeof prefillValue === 'string' && (name.endsWith('.space') || name.endsWith('.externalId') || name.endsWith('.version'))) {
                    const base = name.replace(/\.(space|externalId|version)$/, '');
                    const src = methods.getValues(prefillPath);
                    const [left, ver] = String(src || '').split('@');
                    const [space, externalId] = String(left || '').split(':');
                    if (name.endsWith('.space') && space)
                        value = space;
                    if (name.endsWith('.externalId') && externalId)
                        value = externalId;
                    if (name.endsWith('.version') && ver)
                        value = ver;
                }
            }
            catch { }
            methods.setValue(name, value, { shouldDirty: false, shouldTouch: true, shouldValidate: true });
            didPrefillRef.current = true;
        }
    }, [wantsPrefill, prefillValue, name, methods]);
    // Suggestions pulled from other paths
    const suggestions = React.useMemo(() => {
        const items = [];
        const srcs = Array.isArray(field.suggestFrom) ? field.suggestFrom : [];
        for (const s of srcs) {
            const abs = resolvePath(basePath, s.path);
            const v = methods.watch(abs);
            const has = v !== undefined && v !== null && (!(typeof v === 'string') || String(v).trim().length > 0);
            if (has)
                items.push({ label: s.label, value: v });
        }
        return items;
    }, [field.suggestFrom, basePath, methods]);
    if (!visible)
        return null;
    return (_jsxs("div", { className: "flex flex-col gap-1", children: [_jsxs("label", { className: "text-sm font-medium flex items-center gap-2 text-slate-900", htmlFor: name, children: [_jsx("span", { children: field.label }), field.readonly && (_jsx("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800", children: "\uD83D\uDD12 Protected" })), field.help && (_jsx(InfoTooltip, { definition: field.readonly
                            ? `${field.help} This field is protected for security - actual values should be set in your .env file.`
                            : field.help, example: field.placeholder, label: `Help: ${field.label}`, className: "text-slate-600" }))] }), field.kind === 'text' && (_jsx(UnifiedTextInput, { id: name, name: name, placeholder: field.placeholder, maxLength: field.maxLength, readonly: field.readonly, secretPlaceholder: field.secretPlaceholder })), suggestions.length > 0 && (_jsxs("div", { className: "-mt-1 mb-1 flex flex-wrap items-center gap-2 text-xs text-slate-600", children: [_jsx("span", { children: "Suggestions:" }), suggestions.map((s, i) => (_jsxs("button", { type: "button", className: "rounded-md px-2 py-0.5 ring-1 ring-slate-300 hover:bg-slate-50", onClick: () => methods.setValue(name, s.value, { shouldDirty: true, shouldTouch: true, shouldValidate: true }), "aria-label": s.label ? `Use ${s.label}` : 'Use suggested value', children: [s.label ? `${s.label}: ` : '', _jsx("span", { className: "font-medium text-slate-800", children: String(s.value) })] }, i)))] })), field.kind === 'directory' && _jsx(DirectoryControl, { id: name, placeholder: field.placeholder }), field.kind === 'textarea' && _jsx(UnifiedTextArea, { id: name, name: name, placeholder: field.placeholder, maxLength: field.maxLength }), field.kind === 'select' && (_jsxs(Select, { id: name, ...methods.register(name), children: [_jsx("option", { value: "" }), (computedOptions && computedOptions.length > 0 ? computedOptions : field.options ?? []).map((opt) => (_jsx("option", { value: opt.value, children: opt.label }, opt.value)))] })), field.kind === 'multiselect' && (_jsx(MultiSelectControl, { id: name, options: (computedOptions && computedOptions.length > 0 ? computedOptions : field.options ?? []), placeholder: field.placeholder })), field.kind === 'checkbox' && (_jsx(Checkbox, { id: name, ...methods.register(name) })), field.kind === 'number' && (_jsx(NumberInput, { id: name, placeholder: field.placeholder, ...methods.register(name, { valueAsNumber: true }) })), errorForField?.message && _jsx("p", { className: "text-sm text-red-600", children: String(errorForField.message) })] }));
}
function DirectoryControl({ id, placeholder }) {
    const methods = useFormContext();
    const onPick = methods._onDirectoryPick;
    async function browse() {
        if (!onPick)
            return;
        const picked = await onPick();
        if (picked)
            methods.setValue(id, picked, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    }
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(TextInput, { id: id, placeholder: placeholder, className: "flex-1", ...methods.register(id) }), _jsx("button", { type: "button", className: "rounded-md px-3 py-2 text-sm ring-1 ring-slate-300 hover:bg-slate-50", onClick: browse, "aria-label": "Browse for directory", children: "Browse\u2026" })] }));
}
function GroupField({ field, basePath }) {
    const newBase = field.path ? joinPath(basePath, field.path) : basePath;
    const visible = useIsVisible(field, basePath);
    if (!visible)
        return null;
    return (_jsxs("div", { className: "space-y-2", children: [field.label && _jsx("div", { className: "font-medium", children: field.label }), field.fields.map((child, idx) => {
                const key = child.id || child.path || idx;
                return _jsx(RenderField, { field: child, basePath: newBase }, key);
            })] }));
}
function ArrayField({ field, basePath }) {
    const methods = useFormContext();
    const path = joinPath(basePath, field.path);
    const fa = useFieldArray({ control: methods.control, name: path });
    const visible = useIsVisible(field, basePath);
    if (!visible)
        return null;
    if (field.render === 'table') {
        return _jsx(TableArrayField, { field: field, basePath: basePath });
    }
    function toSingular(label) {
        const l = label.trim();
        // Special-case common plural 'cases' -> 'Case'
        if (/cases$/i.test(l))
            return l.replace(/cases$/i, (m) => (m[0] === 'C' ? 'Case' : 'case'));
        if (l.endsWith('s'))
            return l.slice(0, -1);
        return l;
    }
    const removeAt = React.useCallback((i) => fa.remove(i), [fa]);
    function setDeep(obj, dotted, value) {
        const parts = String(dotted).split('.').filter(Boolean);
        if (parts.length === 0)
            return;
        let cur = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            const p = parts[i];
            if (!p)
                continue;
            if (!cur[p] || typeof cur[p] !== 'object')
                cur[p] = {};
            cur = cur[p];
        }
        const last = parts[parts.length - 1];
        if (last)
            cur[last] = value;
    }
    function computeNewItemPrefill() {
        if (!field.newItemPrefill || field.newItemPrefill.length === 0)
            return {};
        const initial = {};
        for (const m of field.newItemPrefill) {
            const sourcePath = resolvePath(basePath, m.fromPath);
            const v = methods.getValues(sourcePath);
            if (v !== undefined && v !== null && (!(typeof v === 'string') || v.trim().length > 0)) {
                setDeep(initial, m.id, v);
            }
        }
        return initial;
    }
    return (_jsxs("div", { className: "space-y-2", children: [field.label && _jsx("div", { className: "font-medium", children: field.label }), fa.fields.map((f, idx) => {
                const rowBase = `${path}.${idx}`;
                // Avoid reading form values for title to prevent re-render side effects during typing
                const title = undefined;
                return (_jsx(MemoRowCard, { index: idx, title: title ?? `${toSingular(field.label ?? 'Row')} ${idx + 1}`, collapsible: field.collapsible, showIndex: field.showIndex, removeLabel: field.removeLabel, onRemove: () => removeAt(idx), children: _jsx(GroupField, { field: field.item, basePath: rowBase }) }, `${f.id}-${idx}`));
            }), _jsx("button", { type: "button", className: "px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50", onClick: () => fa.append(computeNewItemPrefill()), children: field.addLabel ?? `Add ${toSingular(field.label ?? 'Item')}` })] }));
}
function ArrayOfStringsField({ field, basePath }) {
    const methods = useFormContext();
    const path = joinPath(basePath, field.path);
    const visible = useIsVisible(field, basePath);
    const fa = useFieldArray({ control: methods.control, name: path });
    if (!visible)
        return null;
    return (_jsxs("div", { className: "space-y-2 rounded-xl bg-white p-4 ring-1 ring-slate-200", children: [field.label && (_jsxs("div", { className: "font-medium text-slate-900 flex items-center gap-2", children: [_jsx("span", { children: field.label }), field.help && (_jsx(InfoTooltip, { definition: field.help, example: field.placeholder, label: `Help: ${field.label}`, className: "text-slate-600" }))] })), fa.fields.map((f, idx) => (_jsx(ArrayOfStringsRowControl, { name: `${path}.${idx}`, index: idx, onRemove: () => fa.remove(idx), placeholder: field.placeholder, maxLength: field.maxLength, removeLabel: field.removeLabel }, f.id))), _jsx("button", { type: "button", className: "px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50", onClick: () => {
                    const nextIndex = fa.fields.length;
                    fa.append('');
                    // Focus the newly added input for faster entry
                    setTimeout(() => {
                        try {
                            methods.setFocus?.(`${path}.${nextIndex}`);
                        }
                        catch { }
                    }, 0);
                }, "aria-label": field.addLabel ?? 'Add', children: field.addLabel ?? `Add ${toSingular(field.label ?? 'Item').replace(/s$/, '')}` })] }));
}
// moved ArrayOfStringsRow to components/ArrayOfStringsRow
function ControlInput({ field, name }) {
    const methods = useFormContext();
    if (field.kind === 'text') {
        return (_jsx(TextInput, { placeholder: field.placeholder, maxLength: field.maxLength, readonly: field.readonly, secretPlaceholder: field.secretPlaceholder, className: "px-2 py-1" // Compact styling for table cells
            , ...methods.register(name) }));
    }
    if (field.kind === 'textarea') {
        return (_jsx(TextArea, { placeholder: field.placeholder, maxLength: field.maxLength, rows: 2, className: "px-2 py-1" // Compact styling for table cells
            , ...methods.register(name) }));
    }
    if (field.kind === 'select') {
        return (_jsx(Select, { className: "px-2 py-1", ...methods.register(name), children: field.options?.map((opt) => (_jsx("option", { value: opt.value, children: opt.label }, opt.value))) }));
    }
    if (field.kind === 'multiselect') {
        return _jsx(MultiSelectControl, { id: name, options: field.options ?? [], placeholder: field.placeholder });
    }
    if (field.kind === 'checkbox') {
        return _jsx(Checkbox, { ...methods.register(name) });
    }
    if (field.kind === 'number') {
        return (_jsx(NumberInput, { placeholder: field.placeholder, className: "px-2 py-1" // Compact styling for table cells
            , ...methods.register(name, { valueAsNumber: true }) }));
    }
    return null;
}
function TableArrayField({ field, basePath }) {
    const methods = useFormContext();
    const path = joinPath(basePath, field.path);
    const fa = useFieldArray({ control: methods.control, name: path });
    const allColumns = field.item.fields.filter((f) => f.kind !== 'group' && f.kind !== 'array' && f.kind !== 'arrayOfStrings').map((f) => f.id);
    const columnIds = field.columns && field.columns.length > 0 ? field.columns : allColumns;
    const columns = field.item.fields.filter((f) => f.id && columnIds.includes(f.id));
    const pageSize = field.pageSize ?? 25;
    const [limit, setLimit] = React.useState(pageSize);
    const visible = fa.fields.slice(0, limit);
    function applyTemplate(template, row, root) {
        // Fallbacks: if values are not present in form state, try URL params
        let projectId = root?.projectId;
        let moduleId = root?.moduleId;
        let objectId = row?.objectId;
        try {
            const params = new URL(window.location.href).searchParams;
            if (!projectId)
                projectId = params.get('projectId') || undefined;
            if (!moduleId)
                moduleId = params.get('moduleId') || undefined;
            if (!objectId)
                objectId = params.get('objectId') || undefined;
        }
        catch { }
        return template
            .replace(/\{\{\s*projectId\s*\}\}/g, String(projectId ?? ''))
            .replace(/\{\{\s*moduleId\s*\}\}/g, String(moduleId ?? ''))
            .replace(/\{\{\s*objectId\s*\}\}/g, String(objectId ?? ''));
    }
    return (_jsxs("div", { className: "space-y-2", children: [field.label && _jsx("div", { className: "font-medium", children: field.label }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-slate-600", children: [columns.map((col) => (_jsx("th", { className: "px-2 py-1 font-medium", children: col.label }, col.id))), _jsx("th", { className: "px-2 py-1" }), field.actions && field.actions.length > 0 && _jsx("th", { className: "px-2 py-1", children: "Actions" })] }) }), _jsx("tbody", { children: visible.map((f, idx) => (_jsxs("tr", { className: "bg-white even:bg-slate-50", children: [columns.map((col) => {
                                        const name = `${path}.${idx}.${col.id}`;
                                        return (_jsx("td", { className: "px-2 py-1 align-top", children: _jsx(ControlInput, { field: col, name: name }) }, col.id));
                                    }), _jsx("td", { className: "px-2 py-1 align-top", children: _jsx("button", { type: "button", className: "px-2 py-1 rounded-md ring-1 ring-red-200 text-red-700 hover:bg-red-50", onClick: () => fa.remove(idx), children: field.removeLabel ?? 'Remove' }) }), field.actions && field.actions.length > 0 && (_jsx("td", { className: "px-2 py-1 align-top whitespace-nowrap", children: field.actions.map((a, i) => {
                                            const row = methods.getValues(`${path}.${idx}`);
                                            const root = methods.getValues();
                                            const href = applyTemplate(a.hrefTemplate, row, root);
                                            return (_jsx("a", { href: href, target: a.target ?? '_self', className: "inline-flex items-center px-2 py-1 text-blue-700 hover:underline mr-2", children: a.label }, i));
                                        }) }))] }, f.id))) })] }) }), limit < fa.fields.length && (_jsxs("button", { type: "button", className: "px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50", onClick: () => setLimit((l) => l + pageSize), children: ["Load more\u2026 (", fa.fields.length - limit, " remaining)"] })), _jsx("button", { type: "button", className: "px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50", onClick: () => fa.append({}), children: field.addLabel ?? 'Add' })] }));
}
function RenderField({ field, basePath }) {
    if (field.kind === 'group')
        return _jsx(GroupField, { field: field, basePath: basePath });
    if (field.kind === 'array')
        return _jsx(ArrayField, { field: field, basePath: basePath });
    if (field.kind === 'arrayOfStrings')
        return _jsx(ArrayOfStringsField, { field: field, basePath: basePath });
    return _jsx(ControlField, { field: field, basePath: basePath });
}
export const FormRenderer = React.forwardRef(function FormRenderer({ uiSchema, defaultValues, onSubmit, schema, hideSubmit, onChange, onDirectoryPick, onDirtyChange, externalResetCounter }, ref) {
    const methods = useForm({
        defaultValues: defaultValues,
        resolver: schema ? zodResolver(schema) : undefined,
        shouldUnregister: false,
        mode: 'onChange',
        reValidateMode: 'onChange'
    });
    // Attach directory pick handler to methods context so DirectoryControl can call it
    methods._onDirectoryPick = onDirectoryPick;
    React.useEffect(() => {
        if (!onChange)
            return;
        let frame = null;
        const sub = methods.watch((value) => {
            if (frame)
                cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                onChange(value);
                frame = null;
            });
        });
        return () => {
            sub.unsubscribe();
            if (frame)
                cancelAnimationFrame(frame);
        };
    }, [methods, onChange]);
    // Report dirty-state changes to parent
    React.useEffect(() => {
        if (!onDirtyChange)
            return;
        onDirtyChange(methods.formState.isDirty);
    }, [methods.formState.isDirty, onDirtyChange]);
    // Allow external reset to clear dirty state without changing values
    React.useEffect(() => {
        if (externalResetCounter === undefined)
            return;
        // Reset to current values so focus and typing are preserved and only the dirty flag is cleared
        const current = methods.getValues();
        methods.reset(current);
    }, [externalResetCounter]);
    React.useImperativeHandle(ref, () => ({
        resetDirty: () => {
            const current = methods.getValues();
            methods.reset(current);
        },
        resetTo: (values) => {
            methods.reset(values);
        },
        getValues: () => methods.getValues()
    }), [methods]);
    return (_jsx(FormProvider, { ...methods, children: _jsxs("form", { onSubmit: methods.handleSubmit(onSubmit), className: "space-y-4", autoComplete: "off", "data-lpignore": "true", "data-1p-ignore": "true", children: [uiSchema.fields.map((f, idx) => (_jsx(RenderField, { field: f }, idx))), !hideSubmit && (_jsx("button", { type: "submit", className: "inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700", children: "Submit" }))] }) }));
});
