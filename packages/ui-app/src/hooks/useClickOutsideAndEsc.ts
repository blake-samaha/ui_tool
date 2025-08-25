import React from 'react';

export function useClickOutsideAndEsc<T extends HTMLElement>(onClose: () => void) {
  const ref = React.useRef<T | null>(null);
  React.useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(ev.target as Node)) onClose();
    }
    function handleEsc(ev: KeyboardEvent) {
      if (ev.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);
  return ref;
}


