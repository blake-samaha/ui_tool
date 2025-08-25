import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { TextInput } from '@docs-as-code/ui-components';

export const ArrayOfStringsRow = React.memo(function ArrayOfStringsRow({
    name,
    index,
    onRemove,
    placeholder,
    maxLength,
    removeLabel,
}: {
    name: string;
    index: number;
    onRemove: () => void;
    placeholder?: string;
    maxLength?: number;
    removeLabel?: string;
}) {
    const methods = useFormContext();
    return (
        <div className="flex items-start gap-2">
            <div className="flex-1">
                <Controller name={name as any} control={methods.control} render={({ field: rhf }) => (
                    <TextInput id={name} placeholder={placeholder} maxLength={maxLength} {...rhf} />
                )} />
            </div>
            <button type="button" className="px-2 py-1 rounded-md ring-1 ring-red-200 text-red-700 hover:bg-red-50" onClick={onRemove}>
                {removeLabel ?? 'Remove'}
            </button>
        </div>
    );
});


