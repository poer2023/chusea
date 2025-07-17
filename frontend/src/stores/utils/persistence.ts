/**
 * Zustand persistence utilities for ChUseA
 * Simplified version that works with Zustand v5
 */

import { StateCreator } from 'zustand';

export interface PersistConfig<T> {
  name: string;
  storage?: 'localStorage' | 'sessionStorage';
  partialize?: (state: T) => Partial<T>;
  onRehydrateStorage?: (state: T) => void;
  skipHydration?: boolean;
}

/**
 * Safe storage access with fallback
 */
class SafeStorage {
  private getStorage(type: 'localStorage' | 'sessionStorage'): Storage | null {
    try {
      const storage = type === 'localStorage' ? window.localStorage : window.sessionStorage;
      // Test if storage is available
      const testKey = '__zustand_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return storage;
    } catch {
      return null;
    }
  }

  getItem(key: string, storageType: 'localStorage' | 'sessionStorage' = 'localStorage'): string | null {
    const storage = this.getStorage(storageType);
    if (!storage) return null;
    
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string, storageType: 'localStorage' | 'sessionStorage' = 'localStorage'): void {
    const storage = this.getStorage(storageType);
    if (!storage) return;
    
    try {
      storage.setItem(key, value);
    } catch {
      // Storage might be full, could implement cleanup logic here
    }
  }

  removeItem(key: string, storageType: 'localStorage' | 'sessionStorage' = 'localStorage'): void {
    const storage = this.getStorage(storageType);
    if (!storage) return;
    
    try {
      storage.removeItem(key);
    } catch {
      // Ignore errors
    }
  }
}

const safeStorage = new SafeStorage();

/**
 * Simple persist implementation for Zustand v5
 * This is a basic implementation that can be enhanced with the official persist middleware
 */
export const persist = <T>(
  config: StateCreator<T>,
  options: PersistConfig<T>
): StateCreator<T> => {
  return (set, get, api) => {
    const { name, storage = 'localStorage', partialize, onRehydrateStorage, skipHydration } = options;
    
    // Persist current state
    const persistState = () => {
      try {
        const state = get();
        const stateToPersist = partialize ? partialize(state) : state;
        safeStorage.setItem(name, JSON.stringify(stateToPersist), storage);
      } catch (error) {
        console.warn(`Failed to persist store "${name}":`, error);
      }
    };

    // Enhanced set function that persists after updates
    const enhancedSet = (partial: any, replace?: boolean) => {
      set(partial, replace);
      // Persist state after each update
      setTimeout(persistState, 0); // Async persist to avoid blocking
    };

    // Create the store with enhanced set
    const store = config(enhancedSet, get, api);

    // Rehydrate state from storage
    const rehydrateState = () => {
      try {
        const storedData = safeStorage.getItem(name, storage);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          set(parsedData, true); // Replace entire state
          if (onRehydrateStorage) {
            onRehydrateStorage(get());
          }
        }
      } catch (error) {
        console.warn(`Failed to rehydrate store "${name}":`, error);
      }
    };

    // Auto-rehydrate unless explicitly skipped
    if (!skipHydration && typeof window !== 'undefined') {
      rehydrateState();
    }

    return store;
  };
};

/**
 * Helper to create a store with devtools and optional persistence
 */
export const createStore = <T>(
  name: string,
  config: StateCreator<T>,
  persistConfig?: Omit<PersistConfig<T>, 'name'>
) => {
  if (persistConfig) {
    return persist(config, { name, ...persistConfig });
  }
  return config;
};

/**
 * Clear all persisted data for a store
 */
export const clearPersistedStore = (name: string, storage: 'localStorage' | 'sessionStorage' = 'localStorage') => {
  safeStorage.removeItem(name, storage);
};