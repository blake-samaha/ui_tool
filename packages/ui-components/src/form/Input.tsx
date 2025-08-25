import React from 'react';

export interface BaseInputProps {
    id?: string;
    name?: string;
    placeholder?: string;
    maxLength?: number;
    className?: string;
    readonly?: boolean;
    secretPlaceholder?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    autoFocus?: boolean;
    disabled?: boolean;
    required?: boolean;
    'aria-label'?: string;
    'aria-describedby'?: string;
}

export interface TextInputProps extends BaseInputProps {
    type?: 'text' | 'email' | 'url' | 'tel' | 'password';
}

export interface NumberInputProps extends BaseInputProps {
    min?: number | string;
    max?: number | string;
    step?: number | string;
}

export interface TextAreaProps extends BaseInputProps {
    rows?: number;
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export interface SelectProps extends BaseInputProps {
    children: React.ReactNode;
    multiple?: boolean;
}

export interface CheckboxProps extends Omit<BaseInputProps, 'placeholder' | 'maxLength'> {
    checked?: boolean;
    indeterminate?: boolean;
}

// Base input styling constants
const BASE_CLASSES = 'w-full rounded-md px-3 py-2 ring-1 transition-colors';
const NORMAL_CLASSES = 'ring-slate-300 focus:ring-2 focus:ring-blue-500/40 outline-none bg-white hover:ring-slate-400';
const READONLY_CLASSES = 'ring-slate-300 bg-slate-50 text-slate-600 cursor-not-allowed';
const DISABLED_CLASSES = 'ring-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed';
const ERROR_CLASSES = 'ring-red-300 focus:ring-red-500/40 bg-red-50';

// Common input attributes for security and UX
const COMMON_ATTRS = {
    autoComplete: 'off',
    autoCorrect: 'off',
    autoCapitalize: 'off',
    spellCheck: false,
    'data-lpignore': 'true',
    'data-1p-ignore': 'true',
    'data-form-type': 'other',
    'data-gramm': 'false',
} as const;

function getInputClasses(readonly?: boolean, disabled?: boolean, hasError?: boolean, className?: string): string {
    let classes = BASE_CLASSES;
    
    if (hasError) {
        classes += ` ${ERROR_CLASSES}`;
    } else if (disabled) {
        classes += ` ${DISABLED_CLASSES}`;
    } else if (readonly) {
        classes += ` ${READONLY_CLASSES}`;
    } else {
        classes += ` ${NORMAL_CLASSES}`;
    }
    
    if (className) {
        classes += ` ${className}`;
    }
    
    return classes;
}

// Merge multiple refs (forwarded + internal)
function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
    return (value: T | null) => {
        for (const ref of refs) {
            if (!ref) continue;
            if (typeof ref === 'function') {
                ref(value as T);
            } else {
                (ref as React.MutableRefObject<T | null>).current = value;
            }
        }
    };
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(function TextInputComponent({ 
    type = 'text', 
    readonly, 
    secretPlaceholder, 
    className,
    disabled,
    ...props 
}, ref) {
    const { placeholder, value, ...restProps } = props;
    
    return (
        <input
            ref={ref}
            type={type}
            className={getInputClasses(readonly, disabled, false, className)}
            placeholder={readonly ? secretPlaceholder : placeholder}
            value={readonly ? secretPlaceholder : value}
            readOnly={readonly}
            disabled={disabled}
            {...COMMON_ATTRS}
            {...restProps}
        />
    );
});

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(function NumberInputComponent({ 
    readonly, 
    className, 
    disabled, 
    min, 
    max, 
    step, 
    ...props 
}, ref) {
    return (
        <input
            ref={ref}
            type="number"
            min={min}
            max={max}
            step={step}
            className={getInputClasses(readonly, disabled, false, className)}
            readOnly={readonly}
            disabled={disabled}
            {...COMMON_ATTRS}
            {...props}
        />
    );
});

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextAreaComponent({ 
    rows = 3, 
    resize = 'vertical', 
    readonly, 
    className, 
    disabled, 
    ...props 
}, ref) {
    const resizeClass = {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize'
    }[resize];
    
    return (
        <textarea
            ref={ref}
            rows={rows}
            className={`${getInputClasses(readonly, disabled, false, className)} ${resizeClass}`}
            readOnly={readonly}
            disabled={disabled}
            {...COMMON_ATTRS}
            {...props}
        />
    );
});

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function SelectComponent({ 
    readonly, 
    className, 
    disabled, 
    children, 
    multiple, 
    ...props 
}, ref) {
    return (
        <select
            ref={ref}
            className={getInputClasses(readonly, disabled, false, className)}
            disabled={disabled || readonly}
            multiple={multiple}
            {...props}
        >
            {children}
        </select>
    );
});

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function CheckboxComponent({ 
    readonly, 
    className, 
    disabled, 
    checked, 
    indeterminate, 
    ...props 
}, ref) {
    const localRef = React.useRef<HTMLInputElement>(null);
    const mergedRef = React.useMemo(() => mergeRefs<HTMLInputElement>(ref, localRef), [ref]);
    
    React.useEffect(() => {
        if (localRef.current) {
            localRef.current.indeterminate = indeterminate || false;
        }
    }, [indeterminate]);
    
    return (
        <input
            ref={mergedRef}
            type="checkbox"
            className={`h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/40 focus:ring-2 focus:ring-offset-0 ${disabled || readonly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className || ''}`}
            checked={checked}
            readOnly={readonly}
            disabled={disabled}
            {...props}
        />
    );
});

// Compound component for complete form field with label and help
export interface FormFieldProps {
    label: string;
    help?: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
    htmlFor?: string;
}

export function FormField({ label, help, error, required, children, htmlFor }: FormFieldProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium flex items-center gap-2 text-slate-900" htmlFor={htmlFor}>
                <span>{label}</span>
                {required && <span className="text-red-500">*</span>}
                {help && (
                    <span className="text-xs text-slate-500" title={help}>
                        ❓
                    </span>
                )}
            </label>
            {children}
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
