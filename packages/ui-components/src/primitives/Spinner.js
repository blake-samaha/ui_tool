import { jsx as _jsx } from "react/jsx-runtime";
export function Spinner({ size = 'md', className = '', 'aria-label': ariaLabel = 'Loading' }) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };
    return (_jsx("div", { className: `inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent ${sizeClasses[size]} ${className}`, role: "status", "aria-label": ariaLabel, children: _jsx("span", { className: "sr-only", children: ariaLabel }) }));
}
