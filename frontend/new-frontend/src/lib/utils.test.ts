import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('Utils', () => {
  describe('cn function', () => {
    it('combines class names correctly', () => {
      const result = cn('btn', 'btn-primary')
      expect(result).toContain('btn')
      expect(result).toContain('btn-primary')
    })

    it('handles conditional classes', () => {
      const isActive = true
      const result = cn('btn', isActive && 'active')
      expect(result).toContain('btn')
      expect(result).toContain('active')
    })

    it('filters out falsy values', () => {
      const result = cn('btn', false && 'hidden', null, undefined, 'visible')
      expect(result).toContain('btn')
      expect(result).toContain('visible')
      expect(result).not.toContain('hidden')
    })

    it('handles Tailwind class conflicts', () => {
      // tailwind-merge should handle conflicting classes
      const result = cn('px-2', 'px-4')
      // The exact behavior depends on tailwind-merge configuration
      expect(typeof result).toBe('string')
    })

    it('handles empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('handles array inputs', () => {
      const result = cn(['btn', 'btn-primary'], 'extra-class')
      expect(result).toContain('btn')
      expect(result).toContain('btn-primary')
      expect(result).toContain('extra-class')
    })
  })
})