import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommandFailedModal } from '../src/components/wizard/Modals.js';

// Note: @testing-library/react is not listed; this test is a placeholder showing intended coverage.
// If needed, add @testing-library/react devDependency and test utilities.

describe('CommandFailedModal', () => {
  it('renders stderr and invokes callbacks', async () => {
    const onRetry = vi.fn();
    const onClose = vi.fn();
    render(
      <CommandFailedModal open title="Command Failed" stderr="stderr here" onRetry={onRetry} onClose={onClose} />
    );
    expect(screen.getByText('Command Failed')).toBeTruthy();
    expect(screen.getByText(/stderr here/)).toBeTruthy();
    fireEvent.click(screen.getByText('Retry'));
    expect(onRetry).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });
});
