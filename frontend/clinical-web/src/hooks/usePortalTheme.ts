'use client';

import { useEffect, useState } from 'react';

type PortalTheme = 'light' | 'dark';

const STORAGE_KEY = 'healthtrack:portal-theme';

export function usePortalTheme() {
  const [theme, setTheme] = useState<PortalTheme>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.portalTheme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);

    return () => {
      document.documentElement.removeAttribute('data-portal-theme');
    };
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme };
}
