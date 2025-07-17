/**
 * FastAPI认证集成
 * 处理JWT token管理、用户认证和授权
 */

import { FASTAPI_ENDPOINTS } from './endpoints';
import { FastAPITransformers } from './transformers';

// 认证令牌接口
export interface FastAPIToken {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

// 登录请求接口
export interface FastAPILoginRequest {
  username: string;
  password: string;
}

// 注册请求接口
export interface FastAPIRegisterRequest {
  username: string;
  email: string;
  password: string;
}

// 用户信息接口
export interface FastAPIUser {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

// 认证状态接口
export interface FastAPIAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: FastAPIUser | null;
  token: string | null;
  expiresAt: number | null;
}

// Token存储键
const TOKEN_STORAGE_KEY = 'fastapi_auth_token';
const USER_STORAGE_KEY = 'fastapi_user_info';
const EXPIRES_STORAGE_KEY = 'fastapi_token_expires';

/**
 * FastAPI认证管理器
 */
export class FastAPIAuthManager {
  private static instance: FastAPIAuthManager;
  private authState: FastAPIAuthState;
  private refreshTimer: NodeJS.Timeout | null = null;
  private listeners: Set<(state: FastAPIAuthState) => void> = new Set();

  private constructor() {
    this.authState = {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      expiresAt: null,
    };
    
    // 初始化时从存储中恢复状态
    this.initializeFromStorage();
  }

  public static getInstance(): FastAPIAuthManager {
    if (!FastAPIAuthManager.instance) {
      FastAPIAuthManager.instance = new FastAPIAuthManager();
    }
    return FastAPIAuthManager.instance;
  }

  /**
   * 从本地存储初始化认证状态
   */
  private initializeFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      const userStr = localStorage.getItem(USER_STORAGE_KEY);
      const expiresStr = localStorage.getItem(EXPIRES_STORAGE_KEY);

      if (token && userStr && expiresStr) {
        const user = JSON.parse(userStr);
        const expiresAt = parseInt(expiresStr, 10);
        
        // 检查token是否过期
        if (Date.now() < expiresAt) {
          this.authState = {
            isAuthenticated: true,
            isLoading: false,
            user,
            token,
            expiresAt,
          };
          
          // 设置自动刷新
          this.scheduleTokenRefresh();
        } else {
          // Token已过期，清理存储
          this.clearStorage();
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth from storage:', error);
      this.clearStorage();
    }
  }

  /**
   * 获取当前认证状态
   */
  public getAuthState(): FastAPIAuthState {
    return { ...this.authState };
  }

  /**
   * 订阅认证状态变化
   */
  public subscribe(listener: (state: FastAPIAuthState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 通知所有监听器状态变化
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getAuthState()));
  }

  /**
   * 更新认证状态
   */
  private updateAuthState(updates: Partial<FastAPIAuthState>): void {
    this.authState = { ...this.authState, ...updates };
    this.notifyListeners();
  }

  /**
   * 保存认证信息到本地存储
   */
  private saveToStorage(token: string, user: FastAPIUser, expiresAt: number): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(EXPIRES_STORAGE_KEY, expiresAt.toString());
    } catch (error) {
      console.error('Failed to save auth to storage:', error);
    }
  }

  /**
   * 清理本地存储
   */
  private clearStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(EXPIRES_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear auth storage:', error);
    }
  }

  /**
   * 计算token过期时间
   */
  private calculateExpiresAt(expiresIn?: number): number {
    // 默认30天过期，或使用服务器返回的过期时间
    const defaultExpiresIn = 30 * 24 * 60 * 60; // 30天（秒）
    const expiresInSeconds = expiresIn || defaultExpiresIn;
    return Date.now() + (expiresInSeconds * 1000);
  }

  /**
   * 安排token刷新
   */
  private scheduleTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!this.authState.expiresAt) return;

    // 在过期前5分钟刷新token
    const refreshTime = this.authState.expiresAt - Date.now() - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken();
      }, refreshTime);
    }
  }

  /**
   * 用户登录
   */
  public async login(credentials: FastAPILoginRequest): Promise<void> {
    this.updateAuthState({ isLoading: true });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8002'}${FASTAPI_ENDPOINTS.AUTH.LOGIN_JSON}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Login failed: ${response.status}`);
      }

      const tokenData: FastAPIToken = await response.json();
      
      // 获取用户信息
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8002'}${FASTAPI_ENDPOINTS.AUTH.ME}`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userData: FastAPIUser = await userResponse.json();
      const transformedUser = FastAPITransformers.transformUserResponse(userData);
      
      const expiresAt = this.calculateExpiresAt(tokenData.expires_in);
      
      // 更新状态
      this.updateAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: transformedUser,
        token: tokenData.access_token,
        expiresAt,
      });

      // 保存到本地存储
      this.saveToStorage(tokenData.access_token, transformedUser, expiresAt);
      
      // 安排token刷新
      this.scheduleTokenRefresh();

    } catch (error) {
      this.updateAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        expiresAt: null,
      });
      throw error;
    }
  }

  /**
   * 开发环境自动登录
   */
  public async devLogin(): Promise<void> {
    this.updateAuthState({ isLoading: true });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8002'}${FASTAPI_ENDPOINTS.AUTH.DEV_LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Dev login failed: ${response.status}`);
      }

      const tokenData: FastAPIToken = await response.json();
      
      // 获取用户信息
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8002'}${FASTAPI_ENDPOINTS.AUTH.ME}`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userData: FastAPIUser = await userResponse.json();
      const transformedUser = FastAPITransformers.transformUserResponse(userData);
      
      const expiresAt = this.calculateExpiresAt(tokenData.expires_in);
      
      // 更新状态
      this.updateAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: transformedUser,
        token: tokenData.access_token,
        expiresAt,
      });

      // 保存到本地存储
      this.saveToStorage(tokenData.access_token, transformedUser, expiresAt);
      
      // 安排token刷新
      this.scheduleTokenRefresh();

    } catch (error) {
      this.updateAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        expiresAt: null,
      });
      throw error;
    }
  }

  /**
   * 用户注册
   */
  public async register(userData: FastAPIRegisterRequest): Promise<FastAPIUser> {
    this.updateAuthState({ isLoading: true });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8002'}${FASTAPI_ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Registration failed: ${response.status}`);
      }

      const userData: FastAPIUser = await response.json();
      const transformedUser = FastAPITransformers.transformUserResponse(userData);
      
      // 不需要注册后立即登录，所以只返回用户信息
      return transformedUser;
      
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    } finally {
      this.updateAuthState({ isLoading: false });
    }
  }

  /**
   * 验证token有效性
   */
  public async verifyToken(): Promise<boolean> {
    if (!this.authState.token) return false;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8002'}${FASTAPI_ENDPOINTS.AUTH.VERIFY}`, {
        headers: {
          'Authorization': `Bearer ${this.authState.token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result.valid === true;
      }
      
      return false;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }

  /**
   * 刷新token
   */
  public async refreshToken(): Promise<void> {
    // FastAPI目前没有refresh token机制，这里可以扩展
    // 当前实现：验证现有token，如果无效则要求重新登录
    
    const isValid = await this.verifyToken();
    if (!isValid) {
      this.logout();
      throw new Error('Token expired, please login again');
    }
  }

  /**
   * 用户登出
   */
  public logout(): void {
    // 清理定时器
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    // 更新状态
    this.updateAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      expiresAt: null,
    });

    // 清理本地存储
    this.clearStorage();
  }

  /**
   * 获取认证header
   */
  public getAuthHeader(): Record<string, string> {
    if (!this.authState.token) {
      return {};
    }

    return {
      'Authorization': `Bearer ${this.authState.token}`,
    };
  }

  /**
   * 检查是否已认证
   */
  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated && !!this.authState.token;
  }

  /**
   * 获取当前用户
   */
  public getCurrentUser(): FastAPIUser | null {
    return this.authState.user;
  }

  /**
   * 获取当前token
   */
  public getToken(): string | null {
    return this.authState.token;
  }

  /**
   * 检查开发环境认证状态
   */
  public async getDevAuthStatus(): Promise<any> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8002'}${FASTAPI_ENDPOINTS.AUTH.DEV_STATUS}`);
      
      if (response.ok) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get dev auth status:', error);
      return null;
    }
  }
}

// 创建单例实例
export const fastAPIAuthManager = FastAPIAuthManager.getInstance();

// 导出认证相关的React Hook（如果使用React）
export const useFastAPIAuth = () => {
  // 这个hook可以在React组件中使用，需要配合React状态管理
  return {
    authState: fastAPIAuthManager.getAuthState(),
    login: fastAPIAuthManager.login.bind(fastAPIAuthManager),
    register: fastAPIAuthManager.register.bind(fastAPIAuthManager),
    logout: fastAPIAuthManager.logout.bind(fastAPIAuthManager),
    devLogin: fastAPIAuthManager.devLogin.bind(fastAPIAuthManager),
    verifyToken: fastAPIAuthManager.verifyToken.bind(fastAPIAuthManager),
    isAuthenticated: fastAPIAuthManager.isAuthenticated.bind(fastAPIAuthManager),
    getCurrentUser: fastAPIAuthManager.getCurrentUser.bind(fastAPIAuthManager),
    getToken: fastAPIAuthManager.getToken.bind(fastAPIAuthManager),
    getAuthHeader: fastAPIAuthManager.getAuthHeader.bind(fastAPIAuthManager),
    getDevAuthStatus: fastAPIAuthManager.getDevAuthStatus.bind(fastAPIAuthManager),
    subscribe: fastAPIAuthManager.subscribe.bind(fastAPIAuthManager),
  };
};

// 导出默认实例和类
export default fastAPIAuthManager;