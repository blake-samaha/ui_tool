import React from 'react';

export interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    'aria-label'?: string;
}

export function Spinner({ size = 'md', className = '', 'aria-label': ariaLabel = 'Loading' }: SpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <div
            className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent ${sizeClasses[size]} ${className}`}
            role="status"
            aria-label={ariaLabel}
        >
            <span className="sr-only">{ariaLabel}</span>
        </div>
    );
}
