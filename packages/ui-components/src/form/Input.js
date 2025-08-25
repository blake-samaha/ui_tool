import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
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
};
function getInputClasses(readonly, disabled, hasError, className) {
    let classes = BASE_CLASSES;
    if (hasError) {
        classes += ` ${ERROR_CLASSES}`;
    }
    else if (disabled) {
        classes += ` ${DISABLED_CLASSES}`;
    }
    else if (readonly) {
        classes += ` ${READONLY_CLASSES}`;
    }
    else {
        classes += ` ${NORMAL_CLASSES}`;
    }
    if (className) {
        classes += ` ${className}`;
    }
    return classes;
}
// Merge multiple refs (forwarded + internal)
function mergeRefs(...refs) {
    return (value) => {
        for (const ref of refs) {
            if (!ref)
                continue;
            if (typeof ref === 'function') {
                ref(value);
            }
            else {
                ref.current = value;
            }
        }
    };
}
export const TextInput = React.forwardRef(function TextInputComponent({ type = 'text', readonly, secretPlaceholder, className, disabled, ...props }, ref) {
    const { placeholder, value, ...restProps } = props;
    return (_jsx("input", { ref: ref, type: type, className: getInputClasses(readonly, disabled, false, className), placeholder: readonly ? secretPlaceholder : placeholder, value: readonly ? secretPlaceholder : value, readOnly: readonly, disabled: disabled, ...COMMON_ATTRS, ...restProps }));
});
export const NumberInput = React.forwardRef(function NumberInputComponent({ readonly, className, disabled, min, max, step, ...props }, ref) {
    return (_jsx("input", { ref: ref, type: "number", min: min, max: max, step: step, className: getInputClasses(readonly, disabled, false, className), readOnly: readonly, disabled: disabled, ...COMMON_ATTRS, ...props }));
});
export const TextArea = React.forwardRef(function TextAreaComponent({ rows = 3, resize = 'vertical', readonly, className, disabled, ...props }, ref) {
    const resizeClass = {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize'
    }[resize];
    return (_jsx("textarea", { ref: ref, rows: rows, className: `${getInputClasses(readonly, disabled, false, className)} ${resizeClass}`, readOnly: readonly, disabled: disabled, ...COMMON_ATTRS, ...props }));
});
export const Select = React.forwardRef(function SelectComponent({ readonly, className, disabled, children, multiple, ...props }, ref) {
    return (_jsx("select", { ref: ref, className: getInputClasses(readonly, disabled, false, className), disabled: disabled || readonly, multiple: multiple, ...props, children: children }));
});
export const Checkbox = React.forwardRef(function CheckboxComponent({ readonly, className, disabled, checked, indeterminate, ...props }, ref) {
    const localRef = React.useRef(null);
    const mergedRef = React.useMemo(() => mergeRefs(ref, localRef), [ref]);
    React.useEffect(() => {
        if (localRef.current) {
            localRef.current.indeterminate = indeterminate || false;
        }
    }, [indeterminate]);
    return (_jsx("input", { ref: mergedRef, type: "checkbox", className: `h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/40 focus:ring-2 focus:ring-offset-0 ${disabled || readonly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className || ''}`, checked: checked, readOnly: readonly, disabled: disabled, ...props }));
});
export function FormField({ label, help, error, required, children, htmlFor }) {
    return (_jsxs("div", { className: "flex flex-col gap-1", children: [_jsxs("label", { className: "text-sm font-medium flex items-center gap-2 text-slate-900", htmlFor: htmlFor, children: [_jsx("span", { children: label }), required && _jsx("span", { className: "text-red-500", children: "*" }), help && (_jsx("span", { className: "text-xs text-slate-500", title: help, children: "\u2753" }))] }), children, error && _jsx("p", { className: "text-sm text-red-600", children: error })] }));
}
