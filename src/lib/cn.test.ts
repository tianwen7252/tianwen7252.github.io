import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const isDisabled = false
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe(
      'base active',
    )
  })

  it('should merge conflicting Tailwind classes', () => {
    expect(cn('px-4 py-2', 'px-8')).toBe('py-2 px-8')
  })

  it('should handle undefined and null', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end')
  })

  it('should handle arrays', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('should handle objects', () => {
    expect(cn({ active: true, disabled: false })).toBe('active')
  })
})
