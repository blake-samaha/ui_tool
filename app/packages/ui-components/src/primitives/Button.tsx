import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost';
};

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
    const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors';
    const styles: Record<NonNullable<ButtonProps['variant']>, string> = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'ring-1 ring-slate-300 text-slate-900 hover:bg-slate-50',
        ghost: 'bg-transparent text-blue-700 hover:bg-blue-50'
    };
    return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}
