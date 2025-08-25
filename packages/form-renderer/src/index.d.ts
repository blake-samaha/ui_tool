import React from 'react';
import type { z } from 'zod';
type VisibleWhen = {
    path: string;
    equals?: string | number | boolean;
    in?: Array<string | number | boolean>;
};
export type UIControlField = {
    kind: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'directory' | 'multiselect';
    id: string;
    label: string;
    options?: Array<{
        value: string;
        label: string;
        group?: string;
        help?: string;
    }>;
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
    suggestFrom?: Array<{
        path: string;
        label?: string;
    }>;
    help?: string;
    placeholder?: string;
    maxLength?: number;
    visibleWhen?: VisibleWhen | VisibleWhen[];
    readonly?: boolean;
    secretPlaceholder?: string;
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
    path: string;
    label?: string;
    minItems?: number;
    addLabel?: string;
    removeLabel?: string;
    item: UIGroupField;
    render?: 'cards' | 'table';
    columns?: string[];
    pageSize?: number;
    actions?: Array<{
        label: string;
        hrefTemplate: string;
        target?: '_blank' | '_self';
    }>;
    collapsible?: boolean;
    titleField?: string;
    showIndex?: boolean;
    visibleWhen?: VisibleWhen | VisibleWhen[];
    /**
     * Prefill new array items by copying values from other form paths into specific child ids.
     * Example: [{ id: 'cdf_cluster', fromPath: '$.cdf_cluster' }]
     */
    newItemPrefill?: Array<{
        id: string;
        fromPath: string;
    }>;
};
export type UIArrayStringsField = {
    kind: 'arrayOfStrings';
    path: string;
    label?: string;
    addLabel?: string;
    removeLabel?: string;
    help?: string;
    placeholder?: string;
    maxLength?: number;
    visibleWhen?: VisibleWhen | VisibleWhen[];
};
export type UISchemaField = UIControlField | UIGroupField | UIArrayField | UIArrayStringsField;
export type UISchema = {
    fields: UISchemaField[];
};
export type FormRendererHandle<TSchema extends z.ZodTypeAny = any> = {
    resetDirty: () => void;
    resetTo: (values: Partial<z.infer<TSchema>>) => void;
    getValues: () => z.infer<TSchema>;
};
export declare const FormRenderer: React.ForwardRefExoticComponent<{
    uiSchema: UISchema;
    defaultValues?: Partial<any> | undefined;
    onSubmit: (data: any) => void;
    schema?: z.ZodTypeAny | undefined;
    hideSubmit?: boolean;
    onChange?: ((data: any) => void) | undefined;
    onDirectoryPick?: () => Promise<string | undefined>;
    onDirtyChange?: (isDirty: boolean) => void;
    externalResetCounter?: number;
} & React.RefAttributes<FormRendererHandle<z.ZodTypeAny>>>;
export {};
