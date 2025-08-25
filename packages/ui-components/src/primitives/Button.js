import { jsx as _jsx } from "react/jsx-runtime";
export function Button({ variant = 'primary', className = '', ...props }) {
    const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors';
    const styles = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        // Make secondary buttons stand out with a filled neutral background
        secondary: 'bg-slate-900 text-white hover:bg-slate-800',
        ghost: 'bg-transparent text-blue-700 hover:bg-blue-50'
    };
    return _jsx("button", { className: `${base} ${styles[variant]} ${className}`, ...props });
}
