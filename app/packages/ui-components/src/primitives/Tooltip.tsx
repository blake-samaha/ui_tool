import React from 'react';

export type InfoTooltipProps = {
    definition: string;
    example?: string;
    className?: string;
    label?: string; // optional accessible label
};

/**
 * Lightweight hover/focus tooltip with an information icon inside a circle.
 * No external deps; uses Tailwind classes for styling.
 */
export function InfoTooltip({ definition, example, className = '', label = 'Help' }: InfoTooltipProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <span
            className={`relative inline-flex ${className}`}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
        >
            <button
                type="button"
                aria-label={label}
                className="inline-flex items-center justify-center w-5 h-5 rounded-full ring-1 ring-slate-400 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
                <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    aria-hidden="true"
                >
                    <circle cx="10" cy="10" r="8" className="stroke-current" strokeWidth="1.5" />
                    <path d="M10 8.5v5" className="stroke-current" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="10" cy="6.5" r="1" className="fill-current" />
                </svg>
            </button>
            {open && (
                <div
                    role="tooltip"
                    className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 w-80 max-w-[80vw] rounded-lg bg-slate-900 text-white text-xs shadow-xl ring-1 ring-black/5"
                >
                    <div className="p-3">
                        <div className="font-semibold">Definition</div>
                        <div className="mt-1 opacity-90">{definition}</div>
                        {example && (
                            <>
                                <div className="mt-3 font-semibold">Example</div>
                                <div className="mt-1 opacity-90">{example}</div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </span>
    );
}


