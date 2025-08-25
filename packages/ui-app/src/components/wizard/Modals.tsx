import { ConfirmModal } from '@docs-as-code/ui-components';

export function CommandFailedModal({ open, title, stderr, onRetry, onClose }: { open: boolean; title?: string; stderr?: string; onRetry: () => void; onClose: () => void; }) {
  const message = (stderr || '').length > 0
    ? `${title || 'Command Failed'}\n\nDetails (stderr):\n${stderr}`
    : (title || 'Command Failed');
  return (
    <ConfirmModal
      open={open}
      title={title || 'Command Failed'}
      message={message}
      actions={[
        { label: 'Retry', variant: 'primary', onClick: onRetry },
        { label: 'Close', variant: 'secondary', onClick: onClose }
      ]}
      onClose={onClose}
    />
  );
}

export function UnsavedChangesModal({ open, isSaving, onSaveContinue, onDiscard, onCancel }: { open: boolean; isSaving: boolean; onSaveContinue: () => void; onDiscard: () => void; onCancel: () => void; }) {
  return (
    <ConfirmModal
      open={open}
      title="Unsaved Changes"
      message="You have unsaved changes that will be lost if you navigate away. What would you like to do?"
      actions={[
        { label: 'Save & Continue', variant: 'primary', onClick: onSaveContinue, disabled: isSaving },
        { label: 'Discard Changes', variant: 'secondary', onClick: onDiscard },
        { label: 'Cancel', variant: 'ghost', onClick: onCancel }
      ]}
      onClose={onCancel}
    />
  );
}

export function ValidationWarningModal({ open, details, isSaving, primaryLabel, onContinue, onBack }: { open: boolean; details: { message: string; details?: string[]; isError?: boolean; blockContinue?: boolean } | null; isSaving: boolean; primaryLabel: string; onContinue: () => void; onBack: () => void; }) {
  const title = details?.isError ? 'Validation Issues' : 'Validation Warnings';
  const message = (() => {
    if (!details) return 'This step has validation issues.';
    let text = details.message;
    if (details.details && details.details.length > 0) text += '\n\nSpecific issues:\n' + details.details.map(d => `• ${d}`).join('\n');
    text += details.blockContinue
      ? '\n\nPlease go back and fix these before continuing.'
      : (details.isError ? '\n\nYou can continue anyway and fix these later, or go back to fix them now.' : '\n\nYou can continue anyway or go back to fix these.');
    return text;
  })();
  const actions = details?.blockContinue
    ? [{ label: 'Go Back & Fix', variant: 'secondary' as const, onClick: onBack }]
    : [
        { label: primaryLabel, variant: 'primary' as const, onClick: onContinue, disabled: isSaving },
        { label: 'Go Back & Fix', variant: 'secondary' as const, onClick: onBack }
      ];
  return <ConfirmModal open={open} title={title} message={message} actions={actions} onClose={onBack} />;
}

export function UseCaseUnlinkModal({ open, removedIds, affected, onConfirm, onCancel }: { open: boolean; removedIds: string[]; affected: Array<{ question: string }>; onConfirm: () => void; onCancel: () => void; }) {
  const msg = (() => {
    const lines: string[] = [];
    lines.push(`The following use case IDs are being removed: ${removedIds.join(', ')}`);
    lines.push('It is referenced by these Key Questions:');
    for (const q of affected.slice(0, 8)) lines.push(`• ${q.question}`);
    if (affected.length > 8) lines.push(`• ...and ${affected.length - 8} more`);
    lines.push('Continuing will unlink these references.');
    return lines.join('\n');
  })();
  return (
    <ConfirmModal
      open={open}
      title="Use Case is referenced"
      message={msg}
      actions={[{ label: 'Continue & Remove Links', variant: 'primary', onClick: onConfirm }, { label: 'Cancel', variant: 'secondary', onClick: onCancel }]}
      onClose={onCancel}
    />
  );
}


