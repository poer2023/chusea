// Utility for creating async actions with loading states
export interface AsyncState {
  isLoading: boolean;
  error: string | null;
}

export interface AsyncActions<T> {
  execute: (fn: () => Promise<T>) => Promise<T | null>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const createAsyncActions = <T>(
  set: (fn: (state: any) => any) => void
): AsyncActions<T> => ({
  execute: async (fn: () => Promise<T>): Promise<T | null> => {
    try {
      set((state) => ({ ...state, isLoading: true, error: null }));
      const result = await fn();
      set((state) => ({ ...state, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set((state) => ({ ...state, isLoading: false, error: errorMessage }));
      return null;
    }
  },
  setLoading: (loading: boolean) => {
    set((state) => ({ ...state, isLoading: loading }));
  },
  setError: (error: string | null) => {
    set((state) => ({ ...state, error }));
  },
  clearError: () => {
    set((state) => ({ ...state, error: null }));
  },
});

// Helper for optimistic updates
export const createOptimisticUpdate = <T>(
  set: (fn: (state: any) => any) => void,
  get: () => any
) => {
  return async (
    optimisticUpdate: (state: any) => any,
    asyncFn: () => Promise<T>,
    onError?: (error: Error, previousState: any) => any
  ): Promise<T | null> => {
    const previousState = get();
    
    try {
      // Apply optimistic update immediately
      set(optimisticUpdate);
      
      // Execute async operation
      const result = await asyncFn();
      return result;
    } catch (error) {
      // Revert optimistic update on error
      if (onError) {
        set(() => onError(error as Error, previousState));
      } else {
        set(() => previousState);
      }
      
      throw error;
    }
  };
};