'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'healthtrack:portal-sidebar';
const MOBILE_QUERY = '(max-width: 960px)';

type SidebarStateOptions = {
  defaultOpen?: boolean;
};

const readStoredState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return null;

    const parsed = JSON.parse(stored);
    if (typeof parsed === 'boolean') return parsed;

    if (stored === 'true') return true;
    if (stored === 'false') return false;

    return null;
  } catch {
    return null;
  }
};

export const useSidebarState = (options: SidebarStateOptions = {}) => {
  const { defaultOpen = false } = options;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const media = window.matchMedia(MOBILE_QUERY);

    const applyState = () => {
      const mobile = media.matches;
      setIsMobile(mobile);

      if (mobile) {
        setIsSidebarOpen(false);
        return;
      }

      const stored = readStoredState();
      setIsSidebarOpen(stored ?? defaultOpen);
    };

    applyState();
    setHasLoaded(true);

    media.addEventListener('change', applyState);
    return () => media.removeEventListener('change', applyState);
  }, [defaultOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hasLoaded) return;
    if (isMobile) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(isSidebarOpen));
    } catch {
      // Ignore storage errors (private mode, quota, etc.)
    }
  }, [isSidebarOpen, isMobile, hasLoaded]);

  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setIsSidebarOpen((current) => !current), []);

  return {
    isSidebarOpen,
    isMobile,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    setIsSidebarOpen,
  };
};
