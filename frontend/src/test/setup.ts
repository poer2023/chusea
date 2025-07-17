import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock Next.js font loading
vi.mock('next/font/google', () => ({
  Inter: () => ({
    style: {
      fontFamily: 'Inter, sans-serif',
    },
  }),
}))

// Mock Zustand stores for testing
vi.mock('@/stores', () => ({
  useAuthStore: () => ({
    user: null,
    token: null,
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: false,
  }),
  useUIStore: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    sidebarOpen: false,
    setSidebarOpen: vi.fn(),
  }),
}))

// Mock tRPC client
vi.mock('@/lib/trpc/client', () => ({
  trpc: {
    auth: {
      me: {
        useQuery: () => ({ data: null, isLoading: false, error: null }),
      },
    },
  },
}))

// Setup and cleanup
beforeAll(() => {
  // Add any global setup here
})

afterEach(() => {
  cleanup()
})

afterAll(() => {
  // Add any global cleanup here
})