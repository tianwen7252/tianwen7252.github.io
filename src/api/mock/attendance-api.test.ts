/**
 * Tests for the mock AttendanceApi adapter.
 * Verifies all AttendanceApi interface methods delegate correctly
 * to the underlying mockAttendanceService.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import dayjs from 'dayjs'
import {
  createMockAttendanceApi,
  type MockAttendanceApi,
} from './attendance-api'

describe('createMockAttendanceApi', () => {
  let api: MockAttendanceApi
  const today = dayjs().format('YYYY-MM-DD')

  beforeEach(() => {
    api = createMockAttendanceApi()
    api.reset()
  })

  describe('getAll', () => {
    it('returns all attendance records', () => {
      const result = api.getAll()
      expect(result.length).toBe(4)
    })

    it('returns a new array reference on each call', () => {
      const a = api.getAll()
      const b = api.getAll()
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })
  })

  describe('getById', () => {
    it('returns attendance record when id exists', () => {
      const record = api.getById('att-001')
      expect(record).toBeDefined()
      expect(record!.employeeId).toBe('emp-001')
    })

    it('returns undefined for non-existent id', () => {
      expect(api.getById('non-existent')).toBeUndefined()
    })

    it('returns undefined for empty string id', () => {
      expect(api.getById('')).toBeUndefined()
    })
  })

  describe('getByDate', () => {
    it('returns records for today', () => {
      const records = api.getByDate(today)
      expect(records.length).toBe(4)
    })

    it('returns empty array for date with no records', () => {
      const records = api.getByDate('2020-01-01')
      expect(records.length).toBe(0)
    })

    it('returns empty array for invalid date string', () => {
      const records = api.getByDate('not-a-date')
      expect(records.length).toBe(0)
    })
  })

  describe('getByMonth', () => {
    it('returns records for the current month', () => {
      const now = dayjs()
      const records = api.getByMonth(now.year(), now.month() + 1)
      expect(records.length).toBe(4)
    })

    it('returns empty array for month with no records', () => {
      const records = api.getByMonth(2020, 1)
      expect(records.length).toBe(0)
    })
  })

  describe('getByEmployeeId', () => {
    it('returns all records for a specific employee', () => {
      const records = api.getByEmployeeId('emp-001')
      expect(records.length).toBe(1)
      expect(records[0]!.employeeId).toBe('emp-001')
    })

    it('returns empty array for employee with no records', () => {
      const records = api.getByEmployeeId('emp-004')
      expect(records.length).toBe(0)
    })
  })

  describe('getByEmployeeAndDate', () => {
    it('returns records for a specific employee on a specific date', () => {
      const records = api.getByEmployeeAndDate('emp-001', today)
      expect(records.length).toBe(1)
      expect(records[0]!.employeeId).toBe('emp-001')
      expect(records[0]!.date).toBe(today)
    })

    it('returns empty array for employee with no records on date', () => {
      const records = api.getByEmployeeAndDate('emp-004', today)
      expect(records.length).toBe(0)
    })

    it('returns empty array for non-existent employee', () => {
      const records = api.getByEmployeeAndDate('non-existent', today)
      expect(records.length).toBe(0)
    })
  })

  describe('add', () => {
    it('creates and returns a new attendance record with generated id', () => {
      const result = api.add({
        employeeId: 'emp-004',
        date: today,
        clockIn: Date.now(),
        type: 'regular',
      })
      expect(result.id).toBeDefined()
      expect(result.id.length).toBeGreaterThan(0)
      expect(result.employeeId).toBe('emp-004')
    })

    it('increases total attendance count', () => {
      const beforeCount = api.getAll().length
      api.add({
        employeeId: 'emp-004',
        date: today,
        clockIn: Date.now(),
        type: 'regular',
      })
      expect(api.getAll().length).toBe(beforeCount + 1)
    })
  })

  describe('update', () => {
    it('updates attendance fields and returns updated record', () => {
      const clockOut = Date.now()
      const result = api.update('att-002', { clockOut })
      expect(result).toBeDefined()
      expect(result!.clockOut).toBe(clockOut)
    })

    it('can update the type field', () => {
      const result = api.update('att-001', { type: 'sick_leave' })
      expect(result).toBeDefined()
      expect(result!.type).toBe('sick_leave')
    })

    it('returns undefined for non-existent id', () => {
      expect(
        api.update('non-existent', { clockOut: Date.now() }),
      ).toBeUndefined()
    })
  })

  describe('remove', () => {
    it('removes attendance record and returns true', () => {
      expect(api.remove('att-001')).toBe(true)
      expect(api.getAll().length).toBe(3)
    })

    it('returns false for non-existent id', () => {
      expect(api.remove('non-existent')).toBe(false)
    })
  })

  describe('reset', () => {
    it('restores initial data after mutations', () => {
      api.remove('att-001')
      api.remove('att-002')
      expect(api.getAll().length).toBe(2)

      api.reset()
      expect(api.getAll().length).toBe(4)
    })

    it('restores data after add', () => {
      api.add({
        employeeId: 'emp-004',
        date: today,
        clockIn: Date.now(),
        type: 'regular',
      })
      expect(api.getAll().length).toBe(5)

      api.reset()
      expect(api.getAll().length).toBe(4)
    })
  })

  describe('immutability', () => {
    it('modifying returned array does not affect internal state', () => {
      const records = api.getAll() as unknown[]
      records.push({ id: 'hacked' })
      expect(api.getAll().length).toBe(4)
    })
  })
})
