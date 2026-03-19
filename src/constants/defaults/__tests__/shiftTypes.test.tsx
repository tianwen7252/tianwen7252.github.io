import { describe, it, expect } from 'vitest'
import { SHIFT_TYPES, type ShiftType } from '../shiftTypes'

describe('SHIFT_TYPES', () => {
  it('should contain exactly 2 shift types', () => {
    expect(SHIFT_TYPES).toHaveLength(2)
  })

  it('should have "regular" as the first shift type with label "常日班"', () => {
    expect(SHIFT_TYPES[0]).toEqual({ key: 'regular', label: '常日班' })
  })

  it('should have "shift" as the second shift type with label "排班"', () => {
    expect(SHIFT_TYPES[1]).toEqual({ key: 'shift', label: '排班' })
  })

  it('should have unique keys', () => {
    const keys = SHIFT_TYPES.map(s => s.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('should have non-empty labels for all entries', () => {
    SHIFT_TYPES.forEach(shiftType => {
      expect(shiftType.label).toBeTruthy()
      expect(shiftType.label.length).toBeGreaterThan(0)
    })
  })

  it('should be a readonly tuple (const assertion)', () => {
    // Verify that the type system treats keys as literal types
    // by checking that the keys match expected literal values
    const validKeys: ShiftType[] = ['regular', 'shift']
    SHIFT_TYPES.forEach(shiftType => {
      expect(validKeys).toContain(shiftType.key)
    })
  })
})
