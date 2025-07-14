import { StateStorage } from 'zustand/middleware';

// Safe localStorage wrapper that handles SSR
export const createJSONStorage = (): StateStorage => ({
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(name);
      return item;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(name, value);
    } catch {
      // Silently fail if localStorage is not available
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(name);
    } catch {
      // Silently fail if localStorage is not available
    }
  },
});

// Helper function to create persistent store config
export const createPersistentStore = (name: string, version: number = 1) => ({
  name: `chusea-${name}`,
  version,
  storage: createJSONStorage(),
  // Skip hydration during SSR
  skipHydration: typeof window === 'undefined',
});

// Type-safe local storage utilities
export const safeLocalStorage = {
  getItem: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  setItem: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silently fail
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  },
};