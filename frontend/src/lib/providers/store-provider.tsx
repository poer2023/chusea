'use client';

import { useEffect } from 'react';
import { useSimpleUIStore } from '../stores/simple-stores';

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const { setTheme } = useSimpleUIStore();

  useEffect(() => {
    // Initialize theme on mount
    const theme = useSimpleUIStore.getState().theme;
    if (theme === 'system') {
      setTheme('system');
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (useSimpleUIStore.getState().theme === 'system') {
        setTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [setTheme]);

  return <>{children}</>;
}