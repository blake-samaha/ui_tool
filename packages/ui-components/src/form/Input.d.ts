import React from 'react';
export interface BaseInputProps {
    id?: string;
    name?: string;
    placeholder?: string;
    maxLength?: number;
    className?: string;
    readonly?: boolean;
    secretPlaceholder?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    autoFocus?: boolean;
    disabled?: boolean;
    required?: boolean;
    'aria-label'?: string;
    'aria-describedby'?: string;
}
export interface TextInputProps extends BaseInputProps {
    type?: 'text' | 'email' | 'url' | 'tel' | 'password';
}
export interface NumberInputProps extends BaseInputProps {
    min?: number | string;
    max?: number | string;
    step?: number | string;
}
export interface TextAreaProps extends BaseInputProps {
    rows?: number;
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}
export interface SelectProps extends BaseInputProps {
    children: React.ReactNode;
    multiple?: boolean;
}
export interface CheckboxProps extends Omit<BaseInputProps, 'placeholder' | 'maxLength'> {
    checked?: boolean;
    indeterminate?: boolean;
}
export declare const TextInput: React.ForwardRefExoticComponent<TextInputProps & React.RefAttributes<HTMLInputElement>>;
export declare const NumberInput: React.ForwardRefExoticComponent<NumberInputProps & React.RefAttributes<HTMLInputElement>>;
export declare const TextArea: React.ForwardRefExoticComponent<TextAreaProps & React.RefAttributes<HTMLTextAreaElement>>;
export declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLSelectElement>>;
export declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLInputElement>>;
export interface FormFieldProps {
    label: string;
    help?: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
    htmlFor?: string;
}
export declare function FormField({ label, help, error, required, children, htmlFor }: FormFieldProps): import("react/jsx-runtime").JSX.Element;
