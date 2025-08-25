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
export declare function ConfirmModal({ open, title, message, actions, onClose }: ConfirmModalProps): import("react/jsx-runtime").JSX.Element | null;
