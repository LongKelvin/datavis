'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';

/**
 * Returns whether dark mode is currently active.
 * Safe for SSR — always returns false on the server and syncs on mount,
 * which prevents the React hydration mismatch caused by window.matchMedia.
 */
export function useIsDark(): boolean {
  const theme = useAppStore(s => s.theme);

  // Start with false on both server and initial client render to match SSR output
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    function compute() {
      if (theme === 'dark') return true;
      if (theme === 'light') return false;
      // 'system'
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    setIsDark(compute());

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  return isDark;
}
