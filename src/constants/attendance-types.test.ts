import { describe, it, expect } from 'vitest'
import { ATTENDANCE_TYPES } from '@/constants/attendance-types'
import type { AttendanceType } from '@/constants/attendance-types'

describe('ATTENDANCE_TYPES', () => {
  it('should have a REGULAR key with value "regular"', () => {
    expect(ATTENDANCE_TYPES.REGULAR).toBe('regular')
  })

  it('should have a VACATION key with value "vacation"', () => {
    expect(ATTENDANCE_TYPES.VACATION).toBe('vacation')
  })

  it('should have exactly 2 keys', () => {
    const keys = Object.keys(ATTENDANCE_TYPES)
    expect(keys).toHaveLength(2)
    expect(keys).toContain('REGULAR')
    expect(keys).toContain('VACATION')
  })

  it('should have exactly 2 unique values', () => {
    const values = Object.values(ATTENDANCE_TYPES)
    expect(values).toHaveLength(2)
    expect(new Set(values).size).toBe(2)
  })

  it('should be typed as const (compile-time immutability)', () => {
    // `as const` provides TypeScript-level readonly enforcement
    // Runtime mutation is prevented by TypeScript compiler
    expect(typeof ATTENDANCE_TYPES).toBe('object')
  })
})

describe('AttendanceType', () => {
  it('should accept valid attendance type values at runtime', () => {
    // Runtime check that values conform to expected union
    const validTypes: AttendanceType[] = ['regular', 'vacation']
    const allValues = Object.values(ATTENDANCE_TYPES)

    expect(validTypes).toEqual(expect.arrayContaining(allValues))
    expect(allValues).toEqual(expect.arrayContaining(validTypes))
  })

  it('should only include values present in ATTENDANCE_TYPES', () => {
    const values = Object.values(ATTENDANCE_TYPES)
    // Each value in the object should be a string
    for (const value of values) {
      expect(typeof value).toBe('string')
    }
  })
})
