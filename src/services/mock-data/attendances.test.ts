import { describe, it, expect, beforeEach } from 'vitest'
import dayjs from 'dayjs'
import { mockAttendanceService } from './attendances'

beforeEach(() => {
  mockAttendanceService.reset()
})

describe('mockAttendanceService', () => {
  const today = dayjs().format('YYYY-MM-DD')

  describe('getAll', () => {
    it('returns all sample attendance records', () => {
      const all = mockAttendanceService.getAll()
      expect(all.length).toBe(4)
    })

    it('returns a copy, not a reference', () => {
      const a = mockAttendanceService.getAll()
      const b = mockAttendanceService.getAll()
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })
  })

  describe('getByDate', () => {
    it('returns records for today', () => {
      const records = mockAttendanceService.getByDate(today)
      expect(records.length).toBe(4)
    })

    it('returns empty for dates with no records', () => {
      const records = mockAttendanceService.getByDate('2020-01-01')
      expect(records.length).toBe(0)
    })
  })

  describe('getByMonth', () => {
    it('returns records for current month', () => {
      const now = dayjs()
      const records = mockAttendanceService.getByMonth(
        now.year(),
        now.month() + 1,
      )
      expect(records.length).toBe(4)
    })
  })

  describe('getByEmployeeAndDate', () => {
    it('returns records for specific employee on date', () => {
      const records = mockAttendanceService.getByEmployeeAndDate(
        'emp-001',
        today,
      )
      expect(records.length).toBe(1)
      expect(records[0]!.employeeId).toBe('emp-001')
    })

    it('returns empty for employee with no records', () => {
      const records = mockAttendanceService.getByEmployeeAndDate(
        'emp-004',
        today,
      )
      expect(records.length).toBe(0)
    })
  })

  describe('add', () => {
    it('adds a new attendance record', () => {
      const result = mockAttendanceService.add({
        employeeId: 'emp-004',
        date: today,
        clockIn: Date.now(),
        type: 'regular',
      })
      expect(result.id).toBeDefined()
      expect(result.employeeId).toBe('emp-004')
      expect(mockAttendanceService.getAll().length).toBe(5)
    })
  })

  describe('update', () => {
    it('updates attendance fields', () => {
      const clockOut = Date.now()
      const result = mockAttendanceService.update('att-002', { clockOut })
      expect(result).toBeDefined()
      expect(result!.clockOut).toBe(clockOut)
    })

    it('returns undefined for unknown id', () => {
      expect(
        mockAttendanceService.update('unknown', { clockOut: Date.now() }),
      ).toBeUndefined()
    })
  })

  describe('remove', () => {
    it('removes attendance record', () => {
      expect(mockAttendanceService.remove('att-001')).toBe(true)
      expect(mockAttendanceService.getAll().length).toBe(3)
    })

    it('returns false for unknown id', () => {
      expect(mockAttendanceService.remove('unknown')).toBe(false)
    })
  })

  describe('reset', () => {
    it('restores initial data after mutations', () => {
      mockAttendanceService.remove('att-001')
      mockAttendanceService.remove('att-002')
      expect(mockAttendanceService.getAll().length).toBe(2)

      mockAttendanceService.reset()
      expect(mockAttendanceService.getAll().length).toBe(4)
    })
  })
})
