import React from 'react';
import { InfoTooltip } from '@ui-components/primitives/Tooltip';
import { useForm, FormProvider, useFormContext, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

export type UIControlField = {
    kind: 'text' | 'textarea' | 'select' | 'checkbox' | 'number';
    id: string;
    label: string;
    options?: Array<{ value: string; label: string }>;
    help?: string; // tooltip/help text describing the field and example usage
    placeholder?: string; // optional placeholder for inputs
};

export type UIGroupField = {
    kind: 'group';
    label?: string;
    path?: string;
    fields: UISchemaField[];
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
};

export type UIArrayStringsField = {
    kind: 'arrayOfStrings';
    path: string; // e.g., dataModel.groupedViews
    label?: string;
    addLabel?: string;
    removeLabel?: string;
};

export type UISchemaField = UIControlField | UIGroupField | UIArrayField | UIArrayStringsField;

export type UISchema = { fields: UISchemaField[] };

function joinPath(base: string | undefined, id: string): string {
    return base ? `${base}.${id}` : id;
}

function ControlField({ field, basePath }: { field: UIControlField; basePath?: string }) {
    const methods = useFormContext();
    const name = joinPath(basePath, field.id);
    const fieldState = methods.getFieldState(name as any, methods.formState);
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium flex items-center gap-2" htmlFor={name}>
                <span>{field.label}</span>
                {field.help && (
                    <InfoTooltip
                        definition={field.help}
                        example={field.placeholder}
                        label={`Help: ${field.label}`}
                    />
                )}
            </label>
            {field.kind === 'text' && (
                <input id={name} className="rounded-md px-3 py-2 ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-500/40 outline-none bg-white" placeholder={field.placeholder}
                    {...methods.register(name as any)} />
            )}
            {field.kind === 'textarea' && (
                <textarea id={name} className="rounded-md px-3 py-2 ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-500/40 outline-none bg-white" placeholder={field.placeholder}
                    {...methods.register(name as any)} />)
            }
            {field.kind === 'select' && (
                <select id={name} className="rounded-md px-3 py-2 ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-500/40 outline-none bg-white" {...methods.register(name as any)}>
                    {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            )}
            {field.kind === 'checkbox' && (
                <input id={name} type="checkbox" className="h-4 w-4 rounded" {...methods.register(name as any)} />
            )}
            {field.kind === 'number' && (
                <input id={name} type="number" className="rounded-md px-3 py-2 ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-500/40 outline-none bg-white" placeholder={field.placeholder}
                    {...methods.register(name as any, { valueAsNumber: true })} />
            )}
            {fieldState.error && <p className="text-sm text-red-600">{fieldState.error.message as string}</p>}
        </div>
    );
}

function GroupField({ field, basePath }: { field: UIGroupField; basePath?: string }) {
    const newBase = field.path ? joinPath(basePath, field.path) : basePath;
    return (
        <div className="space-y-2">
            {field.label && <div className="font-medium">{field.label}</div>}
            {field.fields.map((child, idx) => (
                <RenderField key={idx} field={child} basePath={newBase} />
            ))}
        </div>
    );
}

function ArrayField({ field, basePath }: { field: UIArrayField; basePath?: string }) {
    const methods = useFormContext();
    const path = joinPath(basePath, field.path);
    const fa = useFieldArray({ control: methods.control, name: path as any });
    if (field.render === 'table') {
        return <TableArrayField field={field} basePath={basePath} />;
    }
    return (
        <div className="space-y-2">
            {field.label && <div className="font-medium">{field.label}</div>}
            {fa.fields.map((f, idx) => (
                <div key={f.id} className="rounded-lg p-3 space-y-2 ring-1 ring-slate-200 bg-white">
                    <GroupField field={field.item} basePath={`${path}.${idx}`} />
                    <button type="button" className="px-2 py-1 rounded-md ring-1 ring-red-200 text-red-700 hover:bg-red-50" onClick={() => fa.remove(idx)}>
                        {field.removeLabel ?? 'Remove'}
                    </button>
                </div>
            ))}
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

function ArrayOfStringsField({ field, basePath }: { field: UIArrayStringsField; basePath?: string }) {
    const methods = useFormContext();
    const path = joinPath(basePath, field.path);
    const fa = useFieldArray({ control: methods.control, name: path as any });
    return (
        <div className="space-y-2">
            {field.label && <div className="font-medium">{field.label}</div>}
            {fa.fields.map((f, idx) => (
                <div key={f.id} className="flex items-center gap-2">
                    <input className="rounded-md px-3 py-2 ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-500/40 outline-none bg-white flex-1" {...methods.register(`${path}.${idx}` as any)} />
                    <button type="button" className="px-2 py-1 rounded-md ring-1 ring-red-200 text-red-700 hover:bg-red-50" onClick={() => fa.remove(idx)}>
                        {field.removeLabel ?? 'Remove'}
                    </button>
                </div>
            ))}
            <button type="button" className="px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50" onClick={() => fa.append('' as any)}>
                {field.addLabel ?? 'Add'}
            </button>
        </div>
    );
}

function ControlInput({ field, name }: { field: UIControlField; name: string }) {
    const methods = useFormContext();
    if (field.kind === 'text') return <input className="w-full rounded-md px-2 py-1 ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-500/40 outline-none" placeholder={field.placeholder} {...methods.register(name as any)} />;
    if (field.kind === 'textarea') return <textarea className="w-full rounded-md px-2 py-1 ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-500/40 outline-none" placeholder={field.placeholder} {...methods.register(name as any)} />;
    if (field.kind === 'select') return (
        <select className="w-full rounded-md px-2 py-1 ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-500/40 outline-none" {...methods.register(name as any)}>
            {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    );
    if (field.kind === 'checkbox') return <input type="checkbox" className="h-4 w-4 rounded" {...methods.register(name as any)} />;
    if (field.kind === 'number') return <input type="number" className="w-full rounded-md px-2 py-1 ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-500/40 outline-none" placeholder={field.placeholder} {...methods.register(name as any, { valueAsNumber: true })} />;
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
        return template
            .replace(/\{\{\s*moduleId\s*\}\}/g, String(root?.moduleId ?? ''))
            .replace(/\{\{\s*objectId\s*\}\}/g, String(row?.objectId ?? ''));
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

export function FormRenderer<TSchema extends z.ZodTypeAny>({
    uiSchema,
    defaultValues,
    onSubmit,
    schema,
    hideSubmit,
    onChange
}: {
    uiSchema: UISchema;
    defaultValues?: Partial<z.infer<TSchema>>;
    onSubmit: (data: z.infer<TSchema>) => void;
    schema?: TSchema;
    hideSubmit?: boolean;
    onChange?: (data: z.infer<TSchema>) => void;
}) {
    const methods = useForm<z.infer<TSchema>>({
        defaultValues: defaultValues as z.infer<TSchema>,
        resolver: schema ? (zodResolver(schema) as any) : undefined
    });

    React.useEffect(() => {
        if (!onChange) return;
        const sub = methods.watch((value) => onChange(value as any));
        return () => sub.unsubscribe();
    }, [methods, onChange]);

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
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
}
