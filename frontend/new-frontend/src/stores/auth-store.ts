/**
 * Auth Store - User authentication and authorization state management
 * Handles login, logout, user info, permissions, and token management
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist } from './utils/persistence';
import { User, UserSubscription } from '@/types';

// Auth state interface
export interface AuthState {
  // User data
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Token management
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: number | null;
  
  // Permissions
  permissions: string[];
  subscription: UserSubscription | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  updateSubscription: (subscription: UserSubscription) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Utils
  hasPermission: (permission: string) => boolean;
  isSubscriptionActive: () => boolean;
  isTokenExpired: () => boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiresAt: null,
  permissions: [],
  subscription: null,
};

// Create the auth store
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        login: async (credentials: LoginCredentials) => {
          set({ isLoading: true, error: null });
          
          try {
            // Mock API call - replace with actual implementation
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(credentials),
            });

            if (!response.ok) {
              throw new Error('Login failed');
            }

            const data = await response.json();
            const { user, accessToken, refreshToken, expiresIn } = data;

            // Calculate token expiration
            const tokenExpiresAt = Date.now() + (expiresIn * 1000);

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              accessToken,
              refreshToken,
              tokenExpiresAt,
              permissions: user.permissions || [],
              subscription: user.subscription || null,
              error: null,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Login failed',
            });
            throw error;
          }
        },

        logout: () => {
          // Clear tokens from server if needed
          const { accessToken } = get();
          if (accessToken) {
            fetch('/api/auth/logout', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }).catch(() => {
              // Ignore errors during logout
            });
          }

          // Reset state
          set({
            ...initialState,
          });
        },

        refreshAuth: async () => {
          const { refreshToken, isTokenExpired } = get();
          
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Only refresh if token is expired or about to expire (within 5 minutes)
          if (!isTokenExpired() && get().tokenExpiresAt && get().tokenExpiresAt! > Date.now() + 5 * 60 * 1000) {
            return;
          }

          try {
            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
              throw new Error('Token refresh failed');
            }

            const data = await response.json();
            const { accessToken, refreshToken: newRefreshToken, expiresIn } = data;

            const tokenExpiresAt = Date.now() + (expiresIn * 1000);

            set({
              accessToken,
              refreshToken: newRefreshToken,
              tokenExpiresAt,
            });
          } catch (error) {
            // If refresh fails, logout user
            get().logout();
            throw error;
          }
        },

        updateUser: (updates: Partial<User>) => {
          const { user } = get();
          if (user) {
            set({
              user: { ...user, ...updates },
            });
          }
        },

        updateSubscription: (subscription: UserSubscription) => {
          set({ subscription });
          
          // Also update user object if it exists
          const { user } = get();
          if (user) {
            set({
              user: { ...user, subscription },
            });
          }
        },

        setError: (error: string | null) => {
          set({ error });
        },

        clearError: () => {
          set({ error: null });
        },

        // Utility functions
        hasPermission: (permission: string) => {
          const { permissions } = get();
          return permissions.includes(permission) || permissions.includes('admin');
        },

        isSubscriptionActive: () => {
          const { subscription } = get();
          return subscription?.status === 'active';
        },

        isTokenExpired: () => {
          const { tokenExpiresAt } = get();
          if (!tokenExpiresAt) return true;
          return Date.now() >= tokenExpiresAt;
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          tokenExpiresAt: state.tokenExpiresAt,
          permissions: state.permissions,
          subscription: state.subscription,
        }),
        onRehydrateStorage: (state) => {
          // Check if token is expired on rehydration
          if (state.isTokenExpired()) {
            state.logout();
          }
        },
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

// Selectors for common use cases
export const useAuth = () => useAuthStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error,
}));

export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  logout: state.logout,
  refreshAuth: state.refreshAuth,
  updateUser: state.updateUser,
  setError: state.setError,
  clearError: state.clearError,
}));

export const usePermissions = () => useAuthStore((state) => ({
  permissions: state.permissions,
  hasPermission: state.hasPermission,
  isSubscriptionActive: state.isSubscriptionActive,
}));