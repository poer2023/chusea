// Authentication hooks using TanStack Query

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api/client';
import { QUERY_KEYS, API_ENDPOINTS, APP_CONFIG } from '../../lib/constants';
import type {
  AuthUser,
  AuthSession,
  LoginCredentials,
  RegisterData,
  SocialAuthData,
  TwoFactorSetup,
  TwoFactorVerification,
  PasswordResetRequest,
  SessionInfo,
  AuthUserPreferences,
  LoginResponse,
  RegisterResponse,
  RefreshTokenResponse,
  UpdateUserResponse
} from '../../types';

// ============================================================================
// AUTH STATE QUERIES
// ============================================================================

/**
 * Hook to get current user profile
 */
export function useUserProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.USER_PROFILE(),
    queryFn: async (): Promise<AuthUser> => {
      return apiClient.get<AuthUser>(API_ENDPOINTS.USER.PROFILE);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if user is not authenticated
      if (error?.status === 401) return false;
      return failureCount < 2;
    }
  });
}

/**
 * Hook to get user preferences
 */
export function useUserPreferences() {
  return useQuery({
    queryKey: QUERY_KEYS.USER_PREFERENCES(),
    queryFn: async (): Promise<AuthUserPreferences> => {
      return apiClient.get<AuthUserPreferences>(API_ENDPOINTS.USER.PREFERENCES);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get user subscription info
 */
export function useUserSubscription() {
  return useQuery({
    queryKey: QUERY_KEYS.USER_SUBSCRIPTION(),
    queryFn: async () => {
      return apiClient.get(API_ENDPOINTS.USER.SUBSCRIPTION);
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to get user sessions
 */
export function useUserSessions() {
  return useQuery({
    queryKey: QUERY_KEYS.USER_SESSIONS(),
    queryFn: async (): Promise<SessionInfo[]> => {
      return apiClient.get<SessionInfo[]>(API_ENDPOINTS.AUTH.SESSIONS);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get user usage statistics
 */
export function useUserUsage() {
  return useQuery({
    queryKey: [...QUERY_KEYS.AUTH, 'usage'],
    queryFn: async () => {
      return apiClient.get(API_ENDPOINTS.USER.USAGE);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// AUTHENTICATION MUTATIONS
// ============================================================================

/**
 * Hook for user login
 */
export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    },
    onSuccess: (data) => {
      // Store tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.accessToken);
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      }
      
      // Update user data in cache
      queryClient.setQueryData(QUERY_KEYS.USER_PROFILE(), data.user);
      
      // Invalidate all auth-related queries to refetch with new token
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH });
    },
    onError: (error) => {
      // Clear any stale auth data on login failure
      if (typeof window !== 'undefined') {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
      }
      queryClient.clear();
    }
  });
}

/**
 * Hook for user registration
 */
export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: RegisterData): Promise<RegisterResponse> => {
      return apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
    },
    onSuccess: (data) => {
      // Store tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.accessToken);
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      }
      
      // Update user data in cache
      queryClient.setQueryData(QUERY_KEYS.USER_PROFILE(), data.user);
      
      // Invalidate all auth-related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH });
    }
  });
}

/**
 * Hook for social authentication
 */
export function useSocialAuth() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: SocialAuthData): Promise<LoginResponse> => {
      const endpoint = API_ENDPOINTS.AUTH.SOCIAL[data.provider.toUpperCase() as keyof typeof API_ENDPOINTS.AUTH.SOCIAL];
      return apiClient.post<LoginResponse>(endpoint, data);
    },
    onSuccess: (data) => {
      // Store tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.accessToken);
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      }
      
      // Update user data in cache
      queryClient.setQueryData(QUERY_KEYS.USER_PROFILE(), data.user);
      
      // Invalidate all auth-related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH });
    }
  });
}

/**
 * Hook for user logout
 */
export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<void> => {
      return apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT);
    },
    onSuccess: () => {
      // Clear tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
      }
      
      // Clear all cached data
      queryClient.clear();
    },
    onError: () => {
      // Even if logout fails on server, clear local data
      if (typeof window !== 'undefined') {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
      }
      queryClient.clear();
    }
  });
}

/**
 * Hook for token refresh
 */
export function useRefreshToken() {
  return useMutation({
    mutationFn: async (): Promise<RefreshTokenResponse> => {
      const refreshToken = typeof window !== 'undefined' 
        ? localStorage.getItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN)
        : null;
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      return apiClient.post<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken
      });
    },
    onSuccess: (data) => {
      // Update tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.accessToken);
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      }
    },
    onError: () => {
      // Clear tokens on refresh failure
      if (typeof window !== 'undefined') {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
      }
    }
  });
}

// ============================================================================
// PASSWORD MANAGEMENT
// ============================================================================

/**
 * Hook for forgot password
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: PasswordResetRequest): Promise<void> => {
      return apiClient.post<void>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
    }
  });
}

/**
 * Hook for password reset
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: { token: string; newPassword: string }): Promise<void> => {
      return apiClient.post<void>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
    }
  });
}

/**
 * Hook for password change
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
      return apiClient.post<void>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    }
  });
}

// ============================================================================
// TWO-FACTOR AUTHENTICATION
// ============================================================================

/**
 * Hook for setting up 2FA
 */
export function useSetupTwoFactor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<TwoFactorSetup> => {
      return apiClient.post<TwoFactorSetup>(API_ENDPOINTS.AUTH.TWO_FACTOR.SETUP);
    },
    onSuccess: () => {
      // Invalidate user profile to reflect 2FA status
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE() });
    }
  });
}

/**
 * Hook for verifying 2FA setup
 */
export function useVerifyTwoFactor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: TwoFactorVerification): Promise<void> => {
      return apiClient.post<void>(API_ENDPOINTS.AUTH.TWO_FACTOR.VERIFY, data);
    },
    onSuccess: () => {
      // Invalidate user profile to reflect 2FA status
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE() });
    }
  });
}

/**
 * Hook for disabling 2FA
 */
export function useDisableTwoFactor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { password: string }): Promise<void> => {
      return apiClient.post<void>(API_ENDPOINTS.AUTH.TWO_FACTOR.DISABLE, data);
    },
    onSuccess: () => {
      // Invalidate user profile to reflect 2FA status
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE() });
    }
  });
}

/**
 * Hook for generating 2FA backup codes
 */
export function useGenerateBackupCodes() {
  return useMutation({
    mutationFn: async (): Promise<{ backupCodes: string[] }> => {
      return apiClient.post<{ backupCodes: string[] }>(API_ENDPOINTS.AUTH.TWO_FACTOR.BACKUP_CODES);
    }
  });
}

// ============================================================================
// EMAIL VERIFICATION
// ============================================================================

/**
 * Hook for email verification
 */
export function useVerifyEmail() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { token: string }): Promise<void> => {
      return apiClient.post<void>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data);
    },
    onSuccess: () => {
      // Invalidate user profile to reflect email verification status
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE() });
    }
  });
}

/**
 * Hook for resending email verification
 */
export function useResendVerification() {
  return useMutation({
    mutationFn: async (): Promise<void> => {
      return apiClient.post<void>(API_ENDPOINTS.AUTH.RESEND_VERIFICATION);
    }
  });
}

// ============================================================================
// PROFILE MANAGEMENT
// ============================================================================

/**
 * Hook for updating user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<AuthUser>): Promise<UpdateUserResponse> => {
      return apiClient.put<UpdateUserResponse>(API_ENDPOINTS.USER.UPDATE_PROFILE, data);
    },
    onSuccess: (data) => {
      // Update user profile in cache
      queryClient.setQueryData(QUERY_KEYS.USER_PROFILE(), data.user);
    },
    // Optimistic update
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.USER_PROFILE() });
      
      const previousData = queryClient.getQueryData(QUERY_KEYS.USER_PROFILE());
      
      if (previousData) {
        queryClient.setQueryData(QUERY_KEYS.USER_PROFILE(), {
          ...previousData,
          ...newData
        });
      }
      
      return { previousData };
    },
    onError: (error, newData, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(QUERY_KEYS.USER_PROFILE(), context.previousData);
      }
    }
  });
}

/**
 * Hook for updating user preferences
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<AuthUserPreferences>): Promise<{ preferences: AuthUserPreferences }> => {
      return apiClient.put<{ preferences: AuthUserPreferences }>(API_ENDPOINTS.USER.PREFERENCES, data);
    },
    onSuccess: (data) => {
      // Update preferences in cache
      queryClient.setQueryData(QUERY_KEYS.USER_PREFERENCES(), data.preferences);
      
      // Also update preferences in user profile
      queryClient.setQueryData(QUERY_KEYS.USER_PROFILE(), (oldData: AuthUser | undefined) => {
        if (oldData) {
          return { ...oldData, preferences: data.preferences };
        }
        return oldData;
      });
    },
    // Optimistic update
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.USER_PREFERENCES() });
      
      const previousData = queryClient.getQueryData(QUERY_KEYS.USER_PREFERENCES());
      
      if (previousData) {
        queryClient.setQueryData(QUERY_KEYS.USER_PREFERENCES(), {
          ...previousData,
          ...newData
        });
      }
      
      return { previousData };
    },
    onError: (error, newData, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(QUERY_KEYS.USER_PREFERENCES(), context.previousData);
      }
    }
  });
}

/**
 * Hook for uploading user avatar
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File): Promise<{ avatarUrl: string }> => {
      return apiClient.upload<{ avatarUrl: string }>(API_ENDPOINTS.USER.AVATAR, file, {
        additionalData: { purpose: 'avatar' }
      });
    },
    onSuccess: (data) => {
      // Update avatar in user profile
      queryClient.setQueryData(QUERY_KEYS.USER_PROFILE(), (oldData: AuthUser | undefined) => {
        if (oldData) {
          return { ...oldData, avatar: data.avatarUrl };
        }
        return oldData;
      });
    }
  });
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Hook for revoking a specific session
 */
export function useRevokeSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sessionId: string): Promise<void> => {
      return apiClient.delete<void>(API_ENDPOINTS.AUTH.REVOKE_SESSION(sessionId));
    },
    onSuccess: () => {
      // Invalidate sessions query
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_SESSIONS() });
    }
  });
}

/**
 * Hook for revoking all sessions
 */
export function useRevokeAllSessions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<void> => {
      return apiClient.post<void>(API_ENDPOINTS.AUTH.REVOKE_ALL_SESSIONS);
    },
    onSuccess: () => {
      // Clear all data and redirect to login
      queryClient.clear();
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
      }
    }
  });
}

/**
 * Hook for account deletion
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { password: string; confirmation: string }): Promise<void> => {
      return apiClient.delete<void>(API_ENDPOINTS.USER.DELETE_ACCOUNT, {
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      // Clear all data
      queryClient.clear();
      
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
    }
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  const { data: user, isLoading } = useUserProfile();
  
  return {
    isAuthenticated: !!user,
    isLoading,
    user
  };
}

/**
 * Hook to check user permissions
 */
export function usePermissions() {
  const { data: user } = useUserProfile();
  
  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission as any) ?? false;
  };
  
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };
  
  const hasFeature = (feature: string): boolean => {
    return user?.subscription?.features?.[feature as keyof typeof user.subscription.features] ?? false;
  };
  
  return {
    permissions: user?.permissions ?? [],
    role: user?.role,
    hasPermission,
    hasRole,
    hasFeature,
    subscription: user?.subscription
  };
}

/**
 * Hook for automatic token refresh
 */
export function useAutoRefresh() {
  const refreshToken = useRefreshToken();
  
  React.useEffect(() => {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN)
      : null;
    
    if (!token) return;
    
    // Decode token to check expiry (simplified)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;
      
      // Refresh token 5 minutes before expiry
      const refreshTime = Math.max(0, timeUntilExpiry - 5 * 60 * 1000);
      
      const timer = setTimeout(() => {
        refreshToken.mutate();
      }, refreshTime);
      
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  }, [refreshToken]);
}

// React import for useEffect
import React from 'react';