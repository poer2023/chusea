/**
 * 认证API
 * 提供用户注册、登录、获取用户信息等功能
 */

import { apiClient } from './client'
import {
  UserCreate,
  UserResponse,
  Token,
  LoginRequest,
  DevAuthStatus,
  ApiResponse
} from './types'

export class AuthAPI {
  private readonly baseEndpoint = '/api/auth'

  /**
   * 用户注册
   */
  async register(userData: UserCreate): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>(
      `${this.baseEndpoint}/register`,
      userData
    )
    return response
  }

  /**
   * 用户登录 (表单方式)
   */
  async login(credentials: { username: string; password: string }): Promise<Token> {
    const formData = new FormData()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)

    const response = await apiClient.post<Token>(
      `${this.baseEndpoint}/login`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
    return response
  }

  /**
   * 用户登录 (JSON方式)
   */
  async loginJson(credentials: LoginRequest): Promise<Token> {
    const response = await apiClient.post<Token>(
      `${this.baseEndpoint}/login-json`,
      credentials
    )
    return response
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>(`${this.baseEndpoint}/me`)
    return response
  }

  /**
   * 验证令牌有效性
   */
  async verifyToken(): Promise<{ valid: boolean; user_id: string; username: string }> {
    const response = await apiClient.get<{ valid: boolean; user_id: string; username: string }>(
      `${this.baseEndpoint}/verify`
    )
    return response
  }

  /**
   * 开发环境自动登录
   */
  async devAutoLogin(): Promise<Token> {
    const response = await apiClient.post<Token>(`${this.baseEndpoint}/dev-login`)
    return response
  }

  /**
   * 获取开发环境认证状态
   */
  async getDevAuthStatus(): Promise<DevAuthStatus> {
    const response = await apiClient.get<DevAuthStatus>(`${this.baseEndpoint}/dev-status`)
    return response
  }

  /**
   * 设置认证token
   */
  setAuthToken(token: string): void {
    apiClient.setAuthToken(token)
  }

  /**
   * 移除认证token
   */
  removeAuthToken(): void {
    apiClient.removeAuthToken()
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    // 清除本地存储的token
    this.removeAuthToken()
    
    // 如果后端有登出接口，可以在这里调用
    // await apiClient.post('/api/auth/logout')
  }

  /**
   * 检查用户是否已登录
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') {
      return false
    }
    const token = localStorage.getItem('auth_token')
    return Boolean(token)
  }

  /**
   * 获取存储的token
   */
  getStoredToken(): string | null {
    if (typeof window === 'undefined') {
      return null
    }
    return localStorage.getItem('auth_token')
  }

  /**
   * 刷新token (如果后端支持)
   */
  async refreshToken(): Promise<Token> {
    const response = await apiClient.post<Token>(`${this.baseEndpoint}/refresh`)
    return response
  }

  /**
   * 请求重置密码
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${this.baseEndpoint}/password-reset`,
      { email }
    )
    return response
  }

  /**
   * 重置密码
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${this.baseEndpoint}/password-reset/confirm`,
      { token, new_password: newPassword }
    )
    return response
  }

  /**
   * 更改密码
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${this.baseEndpoint}/change-password`,
      { current_password: currentPassword, new_password: newPassword }
    )
    return response
  }

  /**
   * 更新用户信息
   */
  async updateProfile(userData: Partial<UserCreate>): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>(`${this.baseEndpoint}/profile`, userData)
    return response
  }

  /**
   * 删除用户账户
   */
  async deleteAccount(): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`${this.baseEndpoint}/account`)
    return response
  }

  /**
   * 验证邮箱
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${this.baseEndpoint}/verify-email`,
      { token }
    )
    return response
  }

  /**
   * 重新发送验证邮件
   */
  async resendVerificationEmail(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${this.baseEndpoint}/resend-verification`
    )
    return response
  }

  /**
   * 启用两步验证
   */
  async enableTwoFactor(): Promise<{ qr_code: string; backup_codes: string[] }> {
    const response = await apiClient.post<{ qr_code: string; backup_codes: string[] }>(
      `${this.baseEndpoint}/2fa/enable`
    )
    return response
  }

  /**
   * 禁用两步验证
   */
  async disableTwoFactor(code: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${this.baseEndpoint}/2fa/disable`,
      { code }
    )
    return response
  }

  /**
   * 验证两步验证码
   */
  async verifyTwoFactor(code: string): Promise<{ verified: boolean }> {
    const response = await apiClient.post<{ verified: boolean }>(
      `${this.baseEndpoint}/2fa/verify`,
      { code }
    )
    return response
  }

  /**
   * 获取用户会话信息
   */
  async getSessions(): Promise<Array<{
    id: string
    device: string
    ip: string
    location: string
    last_active: string
    current: boolean
  }>> {
    const response = await apiClient.get<Array<{
      id: string
      device: string
      ip: string
      location: string
      last_active: string
      current: boolean
    }>>(`${this.baseEndpoint}/sessions`)
    return response
  }

  /**
   * 撤销会话
   */
  async revokeSession(sessionId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `${this.baseEndpoint}/sessions/${sessionId}`
    )
    return response
  }

  /**
   * 撤销所有其他会话
   */
  async revokeAllSessions(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${this.baseEndpoint}/sessions/revoke-all`
    )
    return response
  }
}

// 创建单例实例
export const authAPI = new AuthAPI()

// 认证相关的工具函数
export const authUtils = {
  /**
   * 检查是否为有效的邮箱格式
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * 检查密码强度
   */
  checkPasswordStrength(password: string): {
    score: number
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push('密码长度至少8个字符')
    }

    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('密码需要包含大写字母')
    }

    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('密码需要包含小写字母')
    }

    if (/[0-9]/.test(password)) {
      score += 1
    } else {
      feedback.push('密码需要包含数字')
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1
    } else {
      feedback.push('密码需要包含特殊字符')
    }

    return { score, feedback }
  },

  /**
   * 检查用户名是否有效
   */
  isValidUsername(username: string): boolean {
    return username.length >= 3 && username.length <= 50 && /^[a-zA-Z0-9_]+$/.test(username)
  },

  /**
   * 获取密码强度文本
   */
  getPasswordStrengthText(score: number): string {
    switch (score) {
      case 0:
      case 1:
        return '弱'
      case 2:
      case 3:
        return '中等'
      case 4:
        return '强'
      case 5:
        return '很强'
      default:
        return '弱'
    }
  },

  /**
   * 获取密码强度颜色
   */
  getPasswordStrengthColor(score: number): string {
    switch (score) {
      case 0:
      case 1:
        return 'red'
      case 2:
      case 3:
        return 'yellow'
      case 4:
        return 'blue'
      case 5:
        return 'green'
      default:
        return 'red'
    }
  }
}

export default authAPI