// Shift type definitions for employee work schedule classification
export const SHIFT_TYPES = [
  { key: 'regular', label: '常日班' },
  { key: 'shift', label: '排班' },
] as const

export type ShiftType = (typeof SHIFT_TYPES)[number]['key']
