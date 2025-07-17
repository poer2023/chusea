// Advanced authentication hooks for ChUseA
import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRouter, call } from '../../lib/api/router';
import { QUERY_KEYS, APP_CONFIG } from '../../lib/constants';
import { useUserProfile } from './use-auth';
import type {
  AuthUser,
  Permission,
  SubscriptionFeatures
} from '../../types';

// ============================================================================
// ADVANCED PERMISSION HOOKS
// ============================================================================

/**
 * Enhanced permission checker with role-based access control
 */
export function useAdvancedPermissions() {
  const { data: user } = useUserProfile();
  
  const checkPermission = React.useCallback((
    permission: string,
    context?: {
      resource?: string;
      resourceId?: string;
      organizationId?: string;
    }
  ): boolean => {
    if (!user?.permissions) return false;
    
    // Check basic permission
    const hasBasicPermission = user.permissions.includes(permission as any);
    
    // If no context, return basic permission
    if (!context) return hasBasicPermission;
    
    // Check contextual permissions
    const contextualPermissions = (user as any).contextualPermissions || {};
    const contextKey = `${context.resource}:${context.resourceId}`;
    
    return hasBasicPermission || 
           contextualPermissions[contextKey]?.includes(permission);
  }, [user]);
  
  const checkRole = React.useCallback((
    role: string,
    context?: {
      organizationId?: string;
      teamId?: string;
    }
  ): boolean => {
    if (!user) return false;
    
    // Check global role
    if (user.role === role) return true;
    
    // Check contextual roles
    if (context && (user as any).contextualRoles) {
      const orgRoles = (user as any).contextualRoles[context.organizationId || ''];
      const teamRoles = (user as any).contextualRoles[context.teamId || ''];
      
      return orgRoles?.includes(role) || teamRoles?.includes(role) || false;
    }
    
    return false;
  }, [user]);
  
  const checkFeature = React.useCallback((
    feature: keyof SubscriptionFeatures
  ): boolean => {
    return user?.subscription?.features?.[feature] ?? false;
  }, [user]);
  
  const checkQuota = React.useCallback((
    quotaType: string
  ): {
    available: boolean;
    used: number;
    limit: number;
    percentage: number;
  } => {
    const quota = (user?.subscription as any)?.quota?.[quotaType];
    
    if (!quota) {
      return {
        available: false,
        used: 0,
        limit: 0,
        percentage: 0,
      };
    }
    
    const percentage = quota.limit > 0 ? (quota.used / quota.limit) * 100 : 0;
    
    return {
      available: quota.used < quota.limit,
      used: quota.used,
      limit: quota.limit,
      percentage,
    };
  }, [user]);
  
  const getEffectivePermissions = React.useCallback((): string[] => {
    if (!user) return [];
    
    const permissions = new Set([...(user.permissions || [])]);
    
    // Add permissions from contextual roles
    if ((user as any).contextualRoles) {
      Object.values((user as any).contextualRoles).flat().forEach(role => {
        // This would need role-to-permission mapping from backend
        // For now, we'll add the role as a permission
        permissions.add(role as any);
      });
    }
    
    return Array.from(permissions);
  }, [user]);
  
  return {
    checkPermission,
    checkRole,
    checkFeature,
    checkQuota,
    getEffectivePermissions,
    user,
    isAdmin: checkRole('admin'),
    isModerator: checkRole('moderator'),
    isEditor: checkPermission('documents:write'),
    isViewer: checkPermission('documents:read'),
  };
}

/**
 * Hook for managing user permissions in real-time
 */
export function usePermissionManager() {
  const queryClient = useQueryClient();
  
  const requestPermission = useMutation({
    mutationFn: async ({
      permission,
      resource,
      resourceId,
      reason
    }: {
      permission: string;
      resource?: string;
      resourceId?: string;
      reason?: string;
    }) => {
      return call('auth.requestPermission', {
        permission,
        resource,
        resourceId,
        reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE() });
    }
  });
  
  const grantPermission = useMutation({
    mutationFn: async ({
      userId,
      permission,
      resource,
      resourceId,
      expiresAt
    }: {
      userId: string;
      permission: string;
      resource?: string;
      resourceId?: string;
      expiresAt?: string;
    }) => {
      return call('auth.grantPermission', {
        userId,
        permission,
        resource,
        resourceId,
        expiresAt,
      });
    }
  });
  
  const revokePermission = useMutation({
    mutationFn: async ({
      userId,
      permission,
      resource,
      resourceId
    }: {
      userId: string;
      permission: string;
      resource?: string;
      resourceId?: string;
    }) => {
      return call('auth.revokePermission', {
        userId,
        permission,
        resource,
        resourceId,
      });
    }
  });
  
  return {
    requestPermission,
    grantPermission,
    revokePermission,
  };
}

// ============================================================================
// OFFLINE SYNC HOOKS
// ============================================================================

/**
 * Hook for offline authentication sync
 */
export function useOfflineAuthSync() {
  const [isOnline, setIsOnline] = React.useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  );
  const [pendingActions, setPendingActions] = React.useState<any[]>([]);
  const queryClient = useQueryClient();
  
  // Monitor online status
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Sync pending actions when coming back online
  React.useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      syncPendingActions();
    }
  }, [isOnline, pendingActions.length]);
  
  const syncPendingActions = async () => {
    for (const action of pendingActions) {
      try {
        await call(action.procedure, action.input);
        // Remove successful action
        setPendingActions(prev => prev.filter(a => a.id !== action.id));
      } catch (error) {
        console.error('Failed to sync action:', action, error);
      }
    }
  };
  
  const queueOfflineAction = React.useCallback((
    procedure: string,
    input: any
  ) => {
    const action = {
      id: Date.now() + Math.random(),
      procedure,
      input,
      timestamp: new Date().toISOString(),
    };
    
    setPendingActions(prev => [...prev, action]);
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.OFFLINE_ACTIONS) || '[]';
      const actions = JSON.parse(stored);
      actions.push(action);
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.OFFLINE_ACTIONS, JSON.stringify(actions));
    }
  }, []);
  
  // Load pending actions from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.OFFLINE_ACTIONS);
      if (stored) {
        try {
          const actions = JSON.parse(stored);
          setPendingActions(actions);
        } catch (error) {
          console.error('Failed to parse stored offline actions:', error);
        }
      }
    }
  }, []);
  
  const clearPendingActions = React.useCallback(() => {
    setPendingActions([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.OFFLINE_ACTIONS);
    }
  }, []);
  
  return {
    isOnline,
    pendingActions,
    queueOfflineAction,
    syncPendingActions,
    clearPendingActions,
    hasConnectivity: isOnline,
  };
}

/**
 * Hook for offline-aware mutations
 */
export function useOfflineAwareMutation<TData, TError, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    enableOfflineQueue?: boolean;
    procedure?: string;
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: TError, variables: TVariables) => void;
  } = {}
) {
  const { isOnline, queueOfflineAction } = useOfflineAuthSync();
  
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      if (!isOnline && options.enableOfflineQueue && options.procedure) {
        queueOfflineAction(options.procedure, variables);
        // Return a placeholder result for offline mode
        return { offline: true, queued: true } as any;
      }
      
      return mutationFn(variables);
    },
    onSuccess: options.onSuccess,
    onError: options.onError,
  });
}

// ============================================================================
// SESSION MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook for advanced session management
 */
export function useSessionManager() {
  const [sessionWarning, setSessionWarning] = React.useState(false);
  const [sessionExpired, setSessionExpired] = React.useState(false);
  const queryClient = useQueryClient();
  
  // Monitor session expiry
  React.useEffect(() => {
    const checkSession = () => {
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      if (!token) return;
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiry = expiryTime - currentTime;
        
        // Show warning 5 minutes before expiry
        if (timeUntilExpiry <= 5 * 60 * 1000 && timeUntilExpiry > 0) {
          setSessionWarning(true);
        }
        
        // Mark as expired
        if (timeUntilExpiry <= 0) {
          setSessionExpired(true);
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    };
    
    // Check immediately and then every minute
    checkSession();
    const interval = setInterval(checkSession, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const extendSession = useMutation({
    mutationFn: async () => {
      return call('auth.extendSession');
    },
    onSuccess: () => {
      setSessionWarning(false);
      setSessionExpired(false);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH });
    }
  });
  
  const terminateAllSessions = useMutation({
    mutationFn: async () => {
      return call('auth.terminateAllSessions');
    },
    onSuccess: () => {
      // Clear all local data
      queryClient.clear();
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
  });
  
  const getActiveSessions = useQuery({
    queryKey: [...QUERY_KEYS.AUTH, 'sessions'],
    queryFn: () => call('auth.getActiveSessions'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const terminateSession = useMutation({
    mutationFn: async (sessionId: string) => {
      return call('auth.terminateSession', { sessionId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.AUTH, 'sessions'] });
    }
  });
  
  return {
    sessionWarning,
    sessionExpired,
    extendSession,
    terminateAllSessions,
    getActiveSessions: getActiveSessions.data || [],
    terminateSession,
    isSessionExpiring: sessionWarning,
    isSessionExpired: sessionExpired,
  };
}

// ============================================================================
// BIOMETRIC AUTHENTICATION HOOKS
// ============================================================================

/**
 * Hook for biometric authentication (WebAuthn)
 */
export function useBiometricAuth() {
  const [isSupported, setIsSupported] = React.useState(false);
  const queryClient = useQueryClient();
  
  // Check WebAuthn support
  React.useEffect(() => {
    setIsSupported(
      typeof window !== 'undefined' &&
      'credentials' in navigator &&
      'create' in navigator.credentials &&
      'get' in navigator.credentials
    );
  }, []);
  
  const registerBiometric = useMutation({
    mutationFn: async () => {
      if (!isSupported) {
        throw new Error('Biometric authentication not supported');
      }
      
      // Get registration options from server
      const options = await call('auth.biometric.getRegistrationOptions');
      
      // Create credentials
      const credential = await navigator.credentials.create({
        publicKey: options
      });
      
      // Register with server
      return call('auth.biometric.register', { credential });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE() });
    }
  });
  
  const authenticateWithBiometric = useMutation({
    mutationFn: async () => {
      if (!isSupported) {
        throw new Error('Biometric authentication not supported');
      }
      
      // Get authentication options from server
      const options = await call('auth.biometric.getAuthenticationOptions');
      
      // Get credentials
      const credential = await navigator.credentials.get({
        publicKey: options
      });
      
      // Authenticate with server
      return call('auth.biometric.authenticate', { credential });
    },
    onSuccess: (data) => {
      // Store tokens
      if (typeof window !== 'undefined' && data.accessToken) {
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.accessToken);
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      }
      
      queryClient.setQueryData(QUERY_KEYS.USER_PROFILE(), data.user);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH });
    }
  });
  
  const removeBiometric = useMutation({
    mutationFn: async () => {
      return call('auth.biometric.remove');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE() });
    }
  });
  
  const getBiometricDevices = useQuery({
    queryKey: [...QUERY_KEYS.AUTH, 'biometric-devices'],
    queryFn: () => call('auth.biometric.getDevices'),
    enabled: isSupported,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  return {
    isSupported,
    registerBiometric,
    authenticateWithBiometric,
    removeBiometric,
    devices: getBiometricDevices.data || [],
    isLoading: registerBiometric.isPending || 
               authenticateWithBiometric.isPending || 
               removeBiometric.isPending,
  };
}

// ============================================================================
// SECURITY AUDIT HOOKS
// ============================================================================

/**
 * Hook for security audit and monitoring
 */
export function useSecurityAudit() {
  const getSecurityLog = useQuery({
    queryKey: [...QUERY_KEYS.AUTH, 'security-log'],
    queryFn: () => call('auth.security.getLog'),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  const getLoginHistory = useQuery({
    queryKey: [...QUERY_KEYS.AUTH, 'login-history'],
    queryFn: () => call('auth.security.getLoginHistory'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const reportSuspiciousActivity = useMutation({
    mutationFn: async ({
      type,
      description,
      metadata
    }: {
      type: string;
      description: string;
      metadata?: Record<string, any>;
    }) => {
      return call('auth.security.reportActivity', {
        type,
        description,
        metadata,
      });
    }
  });
  
  const enableSecurityAlert = useMutation({
    mutationFn: async ({
      type,
      enabled
    }: {
      type: string;
      enabled: boolean;
    }) => {
      return call('auth.security.setAlert', { type, enabled });
    }
  });
  
  return {
    securityLog: getSecurityLog.data || [],
    loginHistory: getLoginHistory.data || [],
    reportSuspiciousActivity,
    enableSecurityAlert,
    isLoading: getSecurityLog.isLoading || getLoginHistory.isLoading,
  };
}