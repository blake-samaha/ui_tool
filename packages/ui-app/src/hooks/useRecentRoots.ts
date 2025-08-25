import React from 'react';

export function useRecentRoots(storageKey = 'docs-as-code.recentRoots', max = 5) {
  const [recent, setRecent] = React.useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
  });

  const addRecent = React.useCallback((root: string) => {
    setRecent((prev) => {
      const next = [root, ...prev.filter((r) => r !== root)].slice(0, max);
      const isSame = prev.length === next.length && prev.every((v, i) => v === next[i]);
      return isSame ? prev : next;
    });
  }, [max]);

  const clearRecent = React.useCallback(() => {
    setRecent([]);
  }, []);

  // Persist to localStorage when list changes
  React.useEffect(() => {
    try {
      if (recent.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(recent));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch {}
  }, [recent, storageKey]);

  return { recent, addRecent, clearRecent, setRecent } as const;
}


