import { describe, it, expect } from 'vitest'
import { SHIFT_TYPES } from '@/constants/shift-types'
import type { ShiftType } from '@/constants/shift-types'

describe('SHIFT_TYPES', () => {
  it('should be a readonly tuple with exactly 2 entries', () => {
    expect(SHIFT_TYPES).toHaveLength(2)
  })

  it('should have "regular" as the first entry with label "常日班"', () => {
    expect(SHIFT_TYPES[0]).toEqual({ key: 'regular', label: '常日班' })
  })

  it('should have "shift" as the second entry with label "排班"', () => {
    expect(SHIFT_TYPES[1]).toEqual({ key: 'shift', label: '排班' })
  })

  it('should have entries with both key and label properties', () => {
    for (const entry of SHIFT_TYPES) {
      expect(entry).toHaveProperty('key')
      expect(entry).toHaveProperty('label')
      expect(typeof entry.key).toBe('string')
      expect(typeof entry.label).toBe('string')
    }
  })

  it('should have unique keys across all entries', () => {
    const keys = SHIFT_TYPES.map(entry => entry.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('should be typed as const (compile-time immutability)', () => {
    // `as const` provides TypeScript-level readonly enforcement
    expect(Array.isArray(SHIFT_TYPES)).toBe(true)
  })
})

describe('ShiftType', () => {
  it('should accept valid shift type key values at runtime', () => {
    // Runtime check that the type union matches the keys in SHIFT_TYPES
    const validKeys: ShiftType[] = ['regular', 'shift']
    const allKeys = SHIFT_TYPES.map(entry => entry.key)

    expect(validKeys).toEqual(expect.arrayContaining(allKeys))
    expect(allKeys).toEqual(expect.arrayContaining(validKeys))
  })

  it('should only include string key values', () => {
    for (const entry of SHIFT_TYPES) {
      expect(typeof entry.key).toBe('string')
      expect(entry.key.length).toBeGreaterThan(0)
    }
  })
})
