import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect } from 'react';
import { Button } from './Button.js';
export function ConfirmModal({ open, title, message, actions, onClose }) {
    // Handle escape key
    useEffect(() => {
        if (!open)
            return;
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose?.();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [open, onClose]);
    // Focus management
    const modalRef = React.useRef(null);
    useEffect(() => {
        if (open && modalRef.current) {
            // Focus the first button when modal opens
            const firstButton = modalRef.current.querySelector('button');
            firstButton?.focus();
        }
    }, [open]);
    if (!open)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", role: "dialog", "aria-modal": "true", "aria-labelledby": "modal-title", "aria-describedby": "modal-description", children: [_jsx("div", { className: "absolute inset-0 bg-black/20 backdrop-blur-sm", onClick: onClose, "aria-hidden": "true" }), _jsx("div", { ref: modalRef, className: "relative max-w-md w-full mx-4 bg-white rounded-xl shadow-xl ring-1 ring-slate-200 overflow-hidden", children: _jsxs("div", { className: "p-6", children: [_jsx("h2", { id: "modal-title", className: "text-lg font-semibold text-slate-900 mb-2", children: title }), _jsx("p", { id: "modal-description", className: "text-sm text-slate-600 mb-6 whitespace-pre-wrap", children: message }), _jsx("div", { className: "flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 sm:justify-end", children: actions.map((action, index) => (_jsx(Button, { variant: action.variant || (index === 0 ? 'primary' : 'ghost'), onClick: action.onClick, disabled: action.disabled, className: "w-full sm:w-auto", children: action.label }, index))) })] }) })] }));
}
