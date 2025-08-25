import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
/**
 * Generic tooltip wrapper for consistent behavior across the app.
 * Ensures sensible width and wrapping so long sentences do not wrap word-by-word.
 */
export function Tooltip({ content, children, className = '', bubbleClassName = '', side = 'bottom' }) {
    const [open, setOpen] = React.useState(false);
    const sidePosition = side === 'bottom'
        ? 'top-full mt-2 left-1/2 -translate-x-1/2'
        : 'bottom-full mb-2 left-1/2 -translate-x-1/2';
    return (_jsxs("span", { className: `relative inline-flex ${className}`, onMouseEnter: () => setOpen(true), onMouseLeave: () => setOpen(false), onFocus: () => setOpen(true), onBlur: () => setOpen(false), children: [children, open && (_jsx("div", { role: "tooltip", className: `${sidePosition} absolute z-50 max-w-[90vw] sm:max-w-[32rem] min-w-[16rem] rounded-lg bg-slate-900 text-white text-xs shadow-xl ring-1 ring-black/5 pointer-events-none ${bubbleClassName}`, children: _jsx("div", { className: "p-3 whitespace-normal break-words hyphens-auto leading-5 text-left", children: content }) }))] }));
}
/**
 * Lightweight hover/focus tooltip with an information icon inside a circle.
 * No external deps; uses Tailwind classes for styling.
 */
export function InfoTooltip({ definition, example, className = '', label = 'Help' }) {
    return (_jsx(Tooltip, { content: (_jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: "Definition" }), _jsx("div", { className: "mt-1 opacity-90", children: definition }), example && (_jsxs(_Fragment, { children: [_jsx("div", { className: "mt-3 font-semibold", children: "Example" }), _jsx("div", { className: "mt-1 opacity-90", children: example })] }))] })), className: className, children: _jsx("button", { type: "button", "aria-label": label, className: "inline-flex items-center justify-center w-5 h-5 rounded-full ring-1 ring-slate-400 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50", children: _jsxs("svg", { viewBox: "0 0 20 20", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: "w-5 h-5", "aria-hidden": "true", children: [_jsx("circle", { cx: "10", cy: "10", r: "8", className: "stroke-current", strokeWidth: "1.4" }), _jsx("text", { x: "10", y: "10", textAnchor: "middle", dominantBaseline: "central", fontSize: "12", fontWeight: "700", fill: "currentColor", children: "?" })] }) }) }));
}
