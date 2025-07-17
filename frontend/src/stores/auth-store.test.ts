import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from './auth-store'

// Mock fetch for tests
global.fetch = vi.fn()

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { getState } = useAuthStore
    act(() => {
      getState().logout()
    })
    vi.clearAllMocks()
  })

  it('initializes with null user and empty token', () => {
    const { result } = renderHook(() => useAuthStore())
    
    expect(result.current.user).toBeNull()
    expect(result.current.accessToken).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('logs in user successfully', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    // Mock successful login response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        user: { id: '1', username: 'testuser', email: 'test@example.com' },
        access_token: 'mock-jwt-token'
      })
    })

    const credentials = {
      email: 'test@example.com',
      password: 'password'
    }

    await act(async () => {
      await result.current.login(credentials)
    })

    expect(result.current.user?.username).toBe('testuser')
    expect(result.current.accessToken).toBe('mock-jwt-token')
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('logs out user successfully', () => {
    const { result } = renderHook(() => useAuthStore())
    
    // Set some initial state to simulate logged in user
    act(() => {
      result.current.updateUser({ id: '1', username: 'testuser', email: 'test@example.com' })
    })

    // Then logout
    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.accessToken).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('updates user profile', () => {
    const { result } = renderHook(() => useAuthStore())
    
    // Set initial user
    act(() => {
      result.current.updateUser({ id: '1', username: 'testuser', email: 'test@example.com' })
    })

    // Update profile
    const updates = {
      username: 'updateduser',
      email: 'updated@example.com'
    }

    act(() => {
      result.current.updateUser(updates)
    })

    expect(result.current.user?.username).toBe('updateduser')
    expect(result.current.user?.email).toBe('updated@example.com')
  })

  it('handles permissions correctly', () => {
    const { result } = renderHook(() => useAuthStore())
    
    expect(result.current.hasPermission('read')).toBe(false)
    
    // Test with permissions would require more setup
    // This is a placeholder test
    expect(result.current.permissions).toEqual([])
  })
})