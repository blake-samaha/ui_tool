import React, { useEffect } from 'react';
import { Button } from './Button.js';

export interface ConfirmModalAction {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
    disabled?: boolean;
}

export interface ConfirmModalProps {
    open: boolean;
    title: string;
    message: string;
    actions: ConfirmModalAction[];
    onClose?: () => void;
}

export function ConfirmModal({ open, title, message, actions, onClose }: ConfirmModalProps) {
    // Handle escape key
    useEffect(() => {
        if (!open) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose?.();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [open, onClose]);

    // Focus management
    const modalRef = React.useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (open && modalRef.current) {
            // Focus the first button when modal opens
            const firstButton = modalRef.current.querySelector('button');
            firstButton?.focus();
        }
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            
            {/* Modal content */}
            <div 
                ref={modalRef}
                className="relative max-w-md w-full mx-4 bg-white rounded-xl shadow-xl ring-1 ring-slate-200 overflow-hidden"
            >
                <div className="p-6">
                    <h2 
                        id="modal-title"
                        className="text-lg font-semibold text-slate-900 mb-2"
                    >
                        {title}
                    </h2>
                    <p 
                        id="modal-description"
                        className="text-sm text-slate-600 mb-6 whitespace-pre-wrap"
                    >
                        {message}
                    </p>
                    
                    <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 sm:justify-end">
                        {actions.map((action, index) => (
                            <Button
                                key={index}
                                variant={action.variant || (index === 0 ? 'primary' : 'ghost')}
                                onClick={action.onClick}
                                disabled={action.disabled}
                                className="w-full sm:w-auto"
                            >
                                {action.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
