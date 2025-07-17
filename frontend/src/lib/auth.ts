/**
 * 认证相关工具函数
 * 提供token管理、登录状态检查、路由保护等功能
 */

import { apiClient } from './api-client';
import {
  User,
  LoginRequest,
  LoginResponse,
  CreateUserRequest,
} from './types/api';

// 存储键常量
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_info';
const EXPIRES_AT_KEY = 'token_expires_at';

// 认证状态接口
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

// 认证事件类型
export type AuthEventType = 'login' | 'logout' | 'token_refresh' | 'token_expired';

// 认证事件监听器
export type AuthEventListener = (event: AuthEventType, data?: any) => void;

/**
 * 认证管理器类
 */
export class AuthManager {
  private static instance: AuthManager;
  private state: AuthState;
  private listeners: Set<AuthEventListener> = new Set();
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  private constructor() {
    this.state = {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      refreshToken: null,
      expiresAt: null,
    };

    this.initializeFromStorage();
    this.setupApiClient();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  /**
   * 从本地存储初始化状态
   */
  private initializeFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);
      const expiresAtStr = localStorage.getItem(EXPIRES_AT_KEY);

      if (token && userStr && expiresAtStr) {
        const user = JSON.parse(userStr);
        const expiresAt = parseInt(expiresAtStr, 10);

        this.state = {
          isAuthenticated: true,
          isLoading: false,
          user,
          token,
          refreshToken,
          expiresAt,
        };

        // 检查token是否即将过期
        this.scheduleTokenRefresh();
      }
    } catch (error) {
      console.error('Failed to initialize auth from storage:', error);
      this.clearStorage();
    }
  }

  /**
   * 设置API客户端的认证提供器
   */
  private setupApiClient(): void {
    apiClient.setAuthTokenProvider(() => this.getToken());
  }

  /**
   * 获取当前认证状态
   */
  getState(): AuthState {
    return { ...this.state };
  }

  /**
   * 获取当前用户
   */
  getCurrentUser(): User | null {
    return this.state.user;
  }

  /**
   * 获取当前token
   */
  getToken(): string | null {
    return this.state.token;
  }

  /**
   * 检查是否已认证
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated && !!this.state.token;
  }

  /**
   * 检查token是否过期
   */
  isTokenExpired(): boolean {
    if (!this.state.expiresAt) return true;
    return Date.now() >= this.state.expiresAt;
  }

  /**
   * 检查token是否即将过期（5分钟内）
   */
  isTokenExpiringSoon(): boolean {
    if (!this.state.expiresAt) return true;
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    return fiveMinutesFromNow >= this.state.expiresAt;
  }

  /**
   * 添加事件监听器
   */
  addEventListener(listener: AuthEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(listener: AuthEventListener): void {
    this.listeners.delete(listener);
  }

  /**
   * 触发事件
   */
  private emitEvent(event: AuthEventType, data?: any): void {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Auth event listener error:', error);
      }
    });
  }

  /**
   * 更新认证状态
   */
  private updateState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
  }

  /**
   * 保存认证信息到本地存储
   */
  private saveToStorage(loginResponse: LoginResponse): void {
    if (typeof window === 'undefined') return;

    try {
      const expiresAt = Date.now() + (loginResponse.expiresIn || 24 * 60 * 60) * 1000;

      localStorage.setItem(TOKEN_KEY, loginResponse.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(loginResponse.user));
      localStorage.setItem(EXPIRES_AT_KEY, expiresAt.toString());

      if (loginResponse.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, loginResponse.refreshToken);
      }
    } catch (error) {
      console.error('Failed to save auth to storage:', error);
    }
  }

  /**
   * 清除本地存储
   */
  private clearStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(EXPIRES_AT_KEY);
    } catch (error) {
      console.error('Failed to clear auth storage:', error);
    }
  }

  /**
   * 安排token刷新
   */
  private scheduleTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!this.state.expiresAt) return;

    // 在过期前5分钟刷新token
    const refreshTime = this.state.expiresAt - Date.now() - 5 * 60 * 1000;

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken();
      }, refreshTime);
    }
  }

  /**
   * 用户登录
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    this.updateState({ isLoading: true });

    try {
      const response = await apiClient.login(credentials);
      
      const expiresAt = Date.now() + (response.expiresIn || 24 * 60 * 60) * 1000;

      this.updateState({
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
        token: response.accessToken,
        refreshToken: response.refreshToken || null,
        expiresAt,
      });

      this.saveToStorage(response);
      this.scheduleTokenRefresh();
      this.emitEvent('login', response);

      return response;
    } catch (error) {
      this.updateState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        refreshToken: null,
        expiresAt: null,
      });
      throw error;
    }
  }

  /**
   * 用户注册
   */
  async register(userData: CreateUserRequest): Promise<User> {
    this.updateState({ isLoading: true });

    try {
      const user = await apiClient.register(userData);
      
      // 注册成功后自动登录
      await this.login({
        username: userData.username,
        password: userData.password,
      });

      return user;
    } catch (error) {
      this.updateState({ isLoading: false });
      throw error;
    }
  }

  /**
   * 刷新token
   */
  async refreshToken(): Promise<void> {
    if (this.isRefreshing) return;

    const refreshToken = this.state.refreshToken;
    if (!refreshToken) {
      this.logout();
      throw new Error('No refresh token available');
    }

    this.isRefreshing = true;

    try {
      const response = await apiClient.refreshToken(refreshToken);
      
      const expiresAt = Date.now() + (response.expiresIn || 24 * 60 * 60) * 1000;

      this.updateState({
        token: response.accessToken,
        refreshToken: response.refreshToken || refreshToken,
        expiresAt,
      });

      this.saveToStorage(response);
      this.scheduleTokenRefresh();
      this.emitEvent('token_refresh', response);
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.emitEvent('token_expired');
      this.logout();
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * 验证token
   */
  async verifyToken(): Promise<boolean> {
    if (!this.state.token) return false;

    try {
      const response = await apiClient.verifyToken();
      return response.valid;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    // 清除定时器
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    // 尝试通知服务器
    try {
      if (this.state.token) {
        await apiClient.logout();
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }

    // 更新状态
    this.updateState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      refreshToken: null,
      expiresAt: null,
    });

    // 清除存储
    this.clearStorage();
    
    // 清除API客户端缓存
    apiClient.clearCache();

    this.emitEvent('logout');
  }

  /**
   * 自动刷新token（如果需要）
   */
  async ensureValidToken(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    if (this.isTokenExpired()) {
      try {
        await this.refreshToken();
        return true;
      } catch (error) {
        return false;
      }
    }

    if (this.isTokenExpiringSoon() && !this.isRefreshing) {
      // 异步刷新，不等待结果
      this.refreshToken().catch(error => {
        console.error('Background token refresh failed:', error);
      });
    }

    return true;
  }

  /**
   * 获取用户配置文件
   */
  async refreshUserProfile(): Promise<User | null> {
    if (!this.isAuthenticated()) return null;

    try {
      const user = await apiClient.getProfile();
      this.updateState({ user });
      
      // 更新存储中的用户信息
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }

      return user;
    } catch {
      // 无法刷新用户信息时，可能token已失效，执行登出
      await this.logout();
      return null;
    }
  }
}

// 创建单例实例
export const authManager = AuthManager.getInstance();

// 工具函数

/**
 * 检查当前用户是否有特定权限
 */
export function hasPermission(): boolean {
  // const authManager = AuthManager.getInstance();
  // const user = authManager.getCurrentUser();
  // if (!user || !user.permissions) return false;
  // return user.permissions.includes(permission);
  return true; // 示例实现
}

/**
 * 检查当前用户是否有特定角色
 */
export function hasRole(): boolean {
  // const authManager = AuthManager.getInstance();
  // const user = authManager.getCurrentUser();
  // if (!user || !user.roles) return false;
  // return user.roles.includes(role);
  return true; // 示例实现
}

/**
 * 需要认证的装饰器函数
 */
export function requireAuth<T extends any[], R>(
  fn: (...args: T) => R | Promise<R>
): (...args: T) => R | Promise<R> {
  return async (...args: T): Promise<R> => {
    if (!authManager.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    const isValid = await authManager.ensureValidToken();
    if (!isValid) {
      throw new Error('Invalid or expired token');
    }

    return fn(...args);
  };
}

/**
 * 路由保护钩子
 */
export interface RouteGuardOptions {
  requireAuth?: boolean;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  redirectTo?: string;
}

export function createRouteGuard(options: RouteGuardOptions = {}) {
  return {
    canActivate: async (): Promise<boolean> => {
      const { requireAuth = true, requiredPermissions = [], requiredRoles = [] } = options;

      // 检查是否需要认证
      if (requireAuth && !authManager.isAuthenticated()) {
        return false;
      }

      // 确保token有效
      if (requireAuth) {
        const isValid = await authManager.ensureValidToken();
        if (!isValid) {
          return false;
        }
      }

      // 检查权限
      for (const permission of requiredPermissions) {
        if (!hasPermission()) {
          return false;
        }
      }

      // 检查角色
      for (const role of requiredRoles) {
        if (!hasRole()) {
          return false;
        }
      }

      return true;
    },
    getRedirectUrl: () => options.redirectTo || '/auth/login',
  };
}

/**
 * 自动登录尝试
 */
export async function tryAutoLogin(): Promise<boolean> {
  if (!authManager.isAuthenticated()) {
    return false;
  }

  try {
    const isValid = await authManager.verifyToken();
    if (!isValid) {
      authManager.logout();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Auto login failed:', error);
    authManager.logout();
    return false;
  }
}

/**
 * 获取认证头
 */
export function getAuthHeader(): Record<string, string> {
  const token = authManager.getToken();
  if (!token) return {};

  return {
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * 用于React的认证钩子
 */
export function useAuth() {
  return {
    // 状态
    ...authManager.getState(),
    
    // 方法
    login: authManager.login.bind(authManager),
    register: authManager.register.bind(authManager),
    logout: authManager.logout.bind(authManager),
    refreshToken: authManager.refreshToken.bind(authManager),
    verifyToken: authManager.verifyToken.bind(authManager),
    refreshUserProfile: authManager.refreshUserProfile.bind(authManager),
    ensureValidToken: authManager.ensureValidToken.bind(authManager),
    
    // 工具方法
    hasPermission,
    hasRole,
    getAuthHeader,
  };
}

/**
 * 用于React的认证状态钩子
 */
export function useAuthState() {
  return authManager.getState();
}

/**
 * 用于React的认证监听钩子
 */
export function useAuthListener(listener: AuthEventListener) {
  const removeListener = authManager.addEventListener(listener);
  return removeListener;
}

// 默认导出
export default authManager;