/**
 * 认证状态管理 - Authentication Store
 * 管理用户信息、登录状态、token等认证相关状态
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist } from './utils/persistence';

// 用户信息接口
export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  displayName: string;
  role: 'user' | 'admin' | 'premium';
  permissions: string[];
  subscription?: UserSubscription;
  profile?: UserProfile;
  createdAt: string;
  updatedAt: string;
}

// 用户订阅信息
export interface UserSubscription {
  id: string;
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  features: string[];
  limits: {
    documentsPerMonth: number;
    aiGenerationsPerMonth: number;
    storageGB: number;
    collaborators: number;
  };
}

// 用户配置文件
export interface UserProfile {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  language: string;
  timezone: string;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyDigest: boolean;
    theme: 'light' | 'dark' | 'system';
  };
}

// 登录凭证
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// 注册信息
export interface RegisterData {
  email: string;
  username: string;
  password: string;
  displayName: string;
  agreeToTerms: boolean;
}

// 认证状态接口
export interface AuthState {
  // 用户数据
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Token管理
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: number | null;
  
  // 权限和订阅
  permissions: string[];
  subscription: UserSubscription | null;
  
  // 登录状态
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
  rememberMe: boolean;
  
  // 操作方法
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateSubscription: (subscription: UserSubscription) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  
  // 错误处理
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // 模态框控制
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
  toggleRememberMe: () => void;
  
  // 权限检查
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isSubscriptionActive: () => boolean;
  canAccessFeature: (feature: string) => boolean;
  isTokenExpired: () => boolean;
  
  // 状态检查
  isAdmin: () => boolean;
  isPremium: () => boolean;
  getRemainingLimits: () => UserSubscription['limits'] | null;
}

// 初始状态
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
  isLoginModalOpen: false,
  isRegisterModalOpen: false,
  rememberMe: false,
};

// 创建认证store
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // 登录
        login: async (credentials: LoginCredentials) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(credentials),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();
            const { user, accessToken, refreshToken, expiresIn } = data;

            // 计算token过期时间
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
              isLoginModalOpen: false,
              rememberMe: credentials.rememberMe || false,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Login failed',
            });
            throw error;
          }
        },

        // 注册
        register: async (data: RegisterData) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Registration failed');
            }

            const responseData = await response.json();
            const { user, accessToken, refreshToken, expiresIn } = responseData;

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
              isRegisterModalOpen: false,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Registration failed',
            });
            throw error;
          }
        },

        // 登出
        logout: () => {
          const { accessToken } = get();
          
          // 通知服务器登出
          if (accessToken) {
            fetch('/api/auth/logout', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }).catch(() => {
              // 忽略登出接口错误
            });
          }

          // 重置状态
          set({
            ...initialState,
          });
        },

        // 刷新认证
        refreshAuth: async () => {
          const { refreshToken, isTokenExpired } = get();
          
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // 检查是否需要刷新（token过期或即将过期）
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
            // 刷新失败，登出用户
            get().logout();
            throw error;
          }
        },

        // 更新用户信息
        updateUser: async (updates: Partial<User>) => {
          const { accessToken, user } = get();
          
          if (!accessToken || !user) {
            throw new Error('User not authenticated');
          }

          try {
            const response = await fetch('/api/user/profile', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify(updates),
            });

            if (!response.ok) {
              throw new Error('Failed to update user');
            }

            const updatedUser = await response.json();
            
            set({
              user: { ...user, ...updatedUser },
            });
          } catch (error) {
            throw error;
          }
        },

        // 更新用户配置
        updateProfile: async (profile: Partial<UserProfile>) => {
          const { accessToken, user } = get();
          
          if (!accessToken || !user) {
            throw new Error('User not authenticated');
          }

          try {
            const response = await fetch('/api/user/profile', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ profile }),
            });

            if (!response.ok) {
              throw new Error('Failed to update profile');
            }

            const updatedProfile = await response.json();
            
            set({
              user: { 
                ...user, 
                profile: { ...user.profile, ...updatedProfile }
              },
            });
          } catch (error) {
            throw error;
          }
        },

        // 更新订阅信息
        updateSubscription: (subscription: UserSubscription) => {
          set({ subscription });
          
          const { user } = get();
          if (user) {
            set({
              user: { ...user, subscription },
            });
          }
        },

        // 修改密码
        changePassword: async (currentPassword: string, newPassword: string) => {
          const { accessToken } = get();
          
          if (!accessToken) {
            throw new Error('User not authenticated');
          }

          try {
            const response = await fetch('/api/auth/change-password', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Password change failed');
            }
          } catch (error) {
            throw error;
          }
        },

        // 重置密码
        resetPassword: async (email: string) => {
          try {
            const response = await fetch('/api/auth/reset-password', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Password reset failed');
            }
          } catch (error) {
            throw error;
          }
        },

        // 验证邮箱
        verifyEmail: async (token: string) => {
          try {
            const response = await fetch('/api/auth/verify-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Email verification failed');
            }

            const { user } = await response.json();
            
            set({
              user,
            });
          } catch (error) {
            throw error;
          }
        },

        // 错误处理
        setError: (error: string | null) => {
          set({ error });
        },

        clearError: () => {
          set({ error: null });
        },

        // 模态框控制
        openLoginModal: () => {
          set({ isLoginModalOpen: true, isRegisterModalOpen: false });
        },

        closeLoginModal: () => {
          set({ isLoginModalOpen: false });
        },

        openRegisterModal: () => {
          set({ isRegisterModalOpen: true, isLoginModalOpen: false });
        },

        closeRegisterModal: () => {
          set({ isRegisterModalOpen: false });
        },

        toggleRememberMe: () => {
          set({ rememberMe: !get().rememberMe });
        },

        // 权限检查
        hasPermission: (permission: string) => {
          const { permissions } = get();
          return permissions.includes(permission) || permissions.includes('admin');
        },

        hasRole: (role: string) => {
          const { user } = get();
          return user?.role === role;
        },

        isSubscriptionActive: () => {
          const { subscription } = get();
          return subscription?.status === 'active';
        },

        canAccessFeature: (feature: string) => {
          const { subscription } = get();
          return subscription?.features.includes(feature) || false;
        },

        isTokenExpired: () => {
          const { tokenExpiresAt } = get();
          if (!tokenExpiresAt) return true;
          return Date.now() >= tokenExpiresAt;
        },

        // 状态检查
        isAdmin: () => {
          const { user } = get();
          return user?.role === 'admin';
        },

        isPremium: () => {
          const { user } = get();
          return user?.role === 'premium' || user?.role === 'admin';
        },

        getRemainingLimits: () => {
          const { subscription } = get();
          return subscription?.limits || null;
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
          rememberMe: state.rememberMe,
        }),
        onRehydrateStorage: (state) => {
          // 重新加载时检查token是否过期
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

// 选择器钩子
export const useAuth = () => useAuthStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error,
  isAdmin: state.isAdmin(),
  isPremium: state.isPremium(),
  isSubscriptionActive: state.isSubscriptionActive(),
}));

export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  register: state.register,
  logout: state.logout,
  refreshAuth: state.refreshAuth,
  updateUser: state.updateUser,
  updateProfile: state.updateProfile,
  changePassword: state.changePassword,
  resetPassword: state.resetPassword,
  verifyEmail: state.verifyEmail,
  setError: state.setError,
  clearError: state.clearError,
}));

export const useAuthModals = () => useAuthStore((state) => ({
  isLoginModalOpen: state.isLoginModalOpen,
  isRegisterModalOpen: state.isRegisterModalOpen,
  rememberMe: state.rememberMe,
  openLoginModal: state.openLoginModal,
  closeLoginModal: state.closeLoginModal,
  openRegisterModal: state.openRegisterModal,
  closeRegisterModal: state.closeRegisterModal,
  toggleRememberMe: state.toggleRememberMe,
}));

export const usePermissions = () => useAuthStore((state) => ({
  permissions: state.permissions,
  subscription: state.subscription,
  hasPermission: state.hasPermission,
  hasRole: state.hasRole,
  canAccessFeature: state.canAccessFeature,
  getRemainingLimits: state.getRemainingLimits,
}));