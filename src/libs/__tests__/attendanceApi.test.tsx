import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Use vi.hoisted to create testDb before vi.mock hoisting
const { testDb } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Dexie = require('dexie').default
  const testDb = new Dexie('TestAttendancesDB')

  testDb.version(1).stores({
    employees: '++id, name, avatar, status, shiftType, employeeNo, isAdmin',
    attendances: '++id, employeeId, date, clockIn, clockOut, type',
  })

  return { testDb }
})

// Mock dataCenter to use our test DB (avoids circular dependency init() crash)
vi.mock('src/libs/dataCenter', () => ({
  db: testDb,
  DB_NAME: 'TestAttendancesDB',
  init: vi.fn(),
  initDB: vi.fn(),
}))

// Mock modules that api.ts imports (besides dataCenter)
vi.mock('src/constants/defaults/commondities', () => ({
  COMMODITY_TYPES: [],
  COMMODITIES: [],
}))
vi.mock('src/constants/defaults/orderTypes', () => ({
  ORDER_TYPES: [],
}))

import { attendances } from '../api'
import { ATTENDANCE_TYPES, type AttendanceType } from 'src/constants/defaults/attendanceTypes'

describe('attendances API', () => {
  beforeEach(async () => {
    await testDb.attendances.clear()
    await testDb.employees.clear()
  })

  afterEach(async () => {
    await testDb.attendances.clear()
    await testDb.employees.clear()
  })

  describe('ATTENDANCE_TYPES constants', () => {
    it('should export REGULAR and VACATION type constants', () => {
      expect(ATTENDANCE_TYPES.REGULAR).toBe('regular')
      expect(ATTENDANCE_TYPES.VACATION).toBe('vacation')
    })

    it('should have correct type values', () => {
      const types: AttendanceType[] = [ATTENDANCE_TYPES.REGULAR, ATTENDANCE_TYPES.VACATION]
      expect(types).toEqual(['regular', 'vacation'])
    })
  })

  describe('add()', () => {
    it('should create a regular attendance record without type (backwards compatible)', async () => {
      const id = await attendances.add({
        employeeId: 1,
        date: '2026-03-19',
        clockIn: 1742342400000,
      })

      const record = await testDb.attendances.get(id)
      expect(record).toBeDefined()
      expect(record!.employeeId).toBe(1)
      expect(record!.date).toBe('2026-03-19')
      expect(record!.clockIn).toBe(1742342400000)
    })

    it('should create an attendance record with type regular', async () => {
      const id = await attendances.add({
        employeeId: 1,
        date: '2026-03-19',
        clockIn: 1742342400000,
        type: 'regular',
      })

      const record = await testDb.attendances.get(id)
      expect(record).toBeDefined()
      expect(record!.type).toBe('regular')
    })

    it('should create a vacation attendance record (type: vacation)', async () => {
      const id = await attendances.add({
        employeeId: 2,
        date: '2026-03-20',
        type: 'vacation',
      })

      const record = await testDb.attendances.get(id)
      expect(record).toBeDefined()
      expect(record!.employeeId).toBe(2)
      expect(record!.date).toBe('2026-03-20')
      expect(record!.type).toBe('vacation')
      // Vacation records should not require clockIn/clockOut
      expect(record!.clockIn).toBeUndefined()
      expect(record!.clockOut).toBeUndefined()
    })

    it('should not mutate the input record', async () => {
      const input = {
        employeeId: 1,
        date: '2026-03-19',
        clockIn: 1742342400000,
        type: 'regular' as const,
      }
      const inputCopy = { ...input }

      await attendances.add(input)

      expect(input).toEqual(inputCopy)
    })
  })

  describe('delete()', () => {
    it('should delete an attendance record by ID', async () => {
      const id = await attendances.add({
        employeeId: 1,
        date: '2026-03-19',
        type: 'vacation',
      })

      await attendances.delete(id as number)

      const record = await testDb.attendances.get(id)
      expect(record).toBeUndefined()
    })

    it('should not throw when deleting a non-existent ID', async () => {
      // Dexie.delete() is a no-op for non-existent IDs
      await expect(attendances.delete(99999)).resolves.not.toThrow()
    })

    it('should only delete the specified record, not others', async () => {
      const id1 = await attendances.add({
        employeeId: 1,
        date: '2026-03-19',
        type: 'vacation',
      })
      const id2 = await attendances.add({
        employeeId: 2,
        date: '2026-03-19',
        type: 'regular',
      })

      await attendances.delete(id1 as number)

      const deleted = await testDb.attendances.get(id1)
      const remaining = await testDb.attendances.get(id2)
      expect(deleted).toBeUndefined()
      expect(remaining).toBeDefined()
      expect(remaining!.employeeId).toBe(2)
    })
  })

  describe('set() — update clockOut (re-clock-out)', () => {
    it('should update clockOut on an existing record', async () => {
      const id = await attendances.add({
        employeeId: 1,
        date: '2026-03-19',
        clockIn: 1742342400000,
      })

      const newClockOut = 1742371200000
      await attendances.set(id as number, { clockOut: newClockOut })

      const record = await testDb.attendances.get(id)
      expect(record!.clockOut).toBe(newClockOut)
      // Other fields should remain unchanged
      expect(record!.clockIn).toBe(1742342400000)
      expect(record!.employeeId).toBe(1)
    })

    it('should update clockOut to a new value when already set (re-clock-out)', async () => {
      const id = await attendances.add({
        employeeId: 1,
        date: '2026-03-19',
        clockIn: 1742342400000,
        clockOut: 1742360000000,
      })

      const updatedClockOut = 1742371200000
      await attendances.set(id as number, { clockOut: updatedClockOut })

      const record = await testDb.attendances.get(id)
      expect(record!.clockOut).toBe(updatedClockOut)
    })
  })

  describe('getByDate()', () => {
    it('should return all attendance records for a given date', async () => {
      await attendances.add({
        employeeId: 1,
        date: '2026-03-19',
        clockIn: 1742342400000,
        type: 'regular',
      })
      await attendances.add({
        employeeId: 2,
        date: '2026-03-19',
        type: 'vacation',
      })
      await attendances.add({
        employeeId: 3,
        date: '2026-03-20',
        clockIn: 1742428800000,
        type: 'regular',
      })

      const records = await attendances.getByDate('2026-03-19')
      expect(records).toHaveLength(2)
      expect(records.map(r => r.employeeId)).toContain(1)
      expect(records.map(r => r.employeeId)).toContain(2)
    })

    it('should return records with the type field present', async () => {
      await attendances.add({
        employeeId: 1,
        date: '2026-03-19',
        clockIn: 1742342400000,
        type: 'regular',
      })
      await attendances.add({
        employeeId: 2,
        date: '2026-03-19',
        type: 'vacation',
      })

      const records = await attendances.getByDate('2026-03-19')
      const regularRecord = records.find(r => r.employeeId === 1)
      const vacationRecord = records.find(r => r.employeeId === 2)

      expect(regularRecord!.type).toBe('regular')
      expect(vacationRecord!.type).toBe('vacation')
    })

    it('should return empty array when no records exist for date', async () => {
      const records = await attendances.getByDate('2099-12-31')
      expect(records).toEqual([])
    })
  })

  describe('getByMonth()', () => {
    it('should return all records for a given year-month', async () => {
      await attendances.add({
        employeeId: 1,
        date: '2026-03-15',
        clockIn: 1742342400000,
        type: 'regular',
      })
      await attendances.add({
        employeeId: 1,
        date: '2026-03-19',
        type: 'vacation',
      })
      await attendances.add({
        employeeId: 1,
        date: '2026-04-01',
        clockIn: 1743465600000,
        type: 'regular',
      })

      const records = await attendances.getByMonth('2026-03')
      expect(records).toHaveLength(2)
      expect(records.every(r => r.date.startsWith('2026-03'))).toBe(true)
    })

    it('should include type field in month query results', async () => {
      await attendances.add({
        employeeId: 1,
        date: '2026-03-10',
        type: 'vacation',
      })

      const records = await attendances.getByMonth('2026-03')
      expect(records[0].type).toBe('vacation')
    })
  })

  describe('edge cases', () => {
    it('should handle attendance record with all fields populated', async () => {
      const id = await attendances.add({
        employeeId: 5,
        date: '2026-03-19',
        clockIn: 1742342400000,
        clockOut: 1742371200000,
        type: 'regular',
      })

      const record = await testDb.attendances.get(id)
      expect(record).toEqual({
        id,
        employeeId: 5,
        date: '2026-03-19',
        clockIn: 1742342400000,
        clockOut: 1742371200000,
        type: 'regular',
      })
    })

    it('should handle string employeeId (legacy compatibility)', async () => {
      const id = await attendances.add({
        employeeId: '42',
        date: '2026-03-19',
        clockIn: 1742342400000,
      })

      const record = await testDb.attendances.get(id)
      expect(record!.employeeId).toBe('42')
    })

    it('should handle multiple vacation records for the same employee on different dates', async () => {
      await attendances.add({
        employeeId: 1,
        date: '2026-03-19',
        type: 'vacation',
      })
      await attendances.add({
        employeeId: 1,
        date: '2026-03-20',
        type: 'vacation',
      })

      const records19 = await attendances.getByDate('2026-03-19')
      const records20 = await attendances.getByDate('2026-03-20')
      expect(records19).toHaveLength(1)
      expect(records20).toHaveLength(1)
      expect(records19[0].type).toBe('vacation')
      expect(records20[0].type).toBe('vacation')
    })
  })
})
