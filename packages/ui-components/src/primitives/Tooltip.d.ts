import React from 'react';
export type TooltipProps = {
    content: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    bubbleClassName?: string;
    side?: 'top' | 'bottom';
};
/**
 * Generic tooltip wrapper for consistent behavior across the app.
 * Ensures sensible width and wrapping so long sentences do not wrap word-by-word.
 */
export declare function Tooltip({ content, children, className, bubbleClassName, side }: TooltipProps): import("react/jsx-runtime").JSX.Element;
export type InfoTooltipProps = {
    definition: string;
    example?: string;
    className?: string;
    label?: string;
};
/**
 * Lightweight hover/focus tooltip with an information icon inside a circle.
 * No external deps; uses Tailwind classes for styling.
 */
export declare function InfoTooltip({ definition, example, className, label }: InfoTooltipProps): import("react/jsx-runtime").JSX.Element;
