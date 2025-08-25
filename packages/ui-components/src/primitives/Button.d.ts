import React from 'react';
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost';
};
export declare function Button({ variant, className, ...props }: ButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
