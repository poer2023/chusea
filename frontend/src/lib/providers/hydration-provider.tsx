'use client';

import { useEffect, useState } from 'react';
import { useSimpleUIStore, useSimpleUserStore, useSimpleDocumentStore } from '../stores/simple-stores';

interface HydrationProviderProps {
  children: React.ReactNode;
}

export function HydrationProvider({ children }: HydrationProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Initialize stores after hydration
    const initializeStores = async () => {
      try {
        // Initialize UI store
        const uiStore = useSimpleUIStore.getState();
        console.log('UI Store initialized:', { theme: uiStore.theme });

        // Initialize user store
        const userStore = useSimpleUserStore.getState();
        console.log('User Store initialized:', { isAuthenticated: userStore.isAuthenticated });

        // Initialize document store
        const documentStore = useSimpleDocumentStore.getState();
        console.log('Document Store initialized:', { documentsCount: documentStore.documents.length });

        // Apply theme to DOM if needed
        if (typeof window !== 'undefined') {
          const theme = uiStore.theme;
          const root = document.documentElement;
          
          if (theme === 'dark') {
            root.classList.add('dark');
          } else if (theme === 'light') {
            root.classList.remove('dark');
          } else {
            // System theme
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (isDark) {
              root.classList.add('dark');
            } else {
              root.classList.remove('dark');
            }
          }
        }

        setIsHydrated(true);
      } catch (error) {
        console.error('Store initialization error:', error);
        setIsHydrated(true); // Still set to true to prevent infinite loading
      }
    };

    initializeStores();
  }, []);

  // Prevent hydration mismatch by showing loading state
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Store synchronization provider
export function StoreSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Sync stores with localStorage on changes
    const unsubscribeUI = useSimpleUIStore.subscribe(
      (state) => state.theme,
      (theme) => {
        console.log('Theme changed:', theme);
        // Additional theme sync logic if needed
      }
    );

    const unsubscribeUser = useSimpleUserStore.subscribe(
      (state) => state.user,
      (user) => {
        console.log('User changed:', user?.email || 'logged out');
        // Additional user sync logic if needed
      }
    );

    const unsubscribeDocument = useSimpleDocumentStore.subscribe(
      (state) => state.documents,
      (documents) => {
        console.log('Documents changed:', documents.length);
        // Additional document sync logic if needed
      }
    );

    return () => {
      unsubscribeUI();
      unsubscribeUser();
      unsubscribeDocument();
    };
  }, []);

  return <>{children}</>;
}

// Combined initialization provider
export function InitializationProvider({ children }: { children: React.ReactNode }) {
  return (
    <HydrationProvider>
      <StoreSyncProvider>
        {children}
      </StoreSyncProvider>
    </HydrationProvider>
  );
}

// Hook to check if app is hydrated
export function useIsHydrated() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

// Hook to safely access localStorage
export function useSafeLocalStorage() {
  const isHydrated = useIsHydrated();

  const getItem = (key: string) => {
    if (!isHydrated || typeof window === 'undefined') {
      return null;
    }
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('LocalStorage access failed:', error);
      return null;
    }
  };

  const setItem = (key: string, value: string) => {
    if (!isHydrated || typeof window === 'undefined') {
      return false;
    }
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('LocalStorage write failed:', error);
      return false;
    }
  };

  const removeItem = (key: string) => {
    if (!isHydrated || typeof window === 'undefined') {
      return false;
    }
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('LocalStorage remove failed:', error);
      return false;
    }
  };

  return { getItem, setItem, removeItem, isHydrated };
}