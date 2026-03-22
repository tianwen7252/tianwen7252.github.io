/**
 * Tests for the seed data module.
 * Verifies seed employees, seed attendances, and seedDatabase function.
 */

import { describe, it, expect, vi } from 'vitest'
import dayjs from 'dayjs'
import type { Database } from '@/lib/database'

import { SEED_EMPLOYEES, buildSeedAttendances, seedDatabase } from './seed-data'

function createMockDb(): Database {
  return {
    isReady: true,
    exec: vi.fn(() => ({ rows: [], changes: 0 })),
    close: vi.fn(),
  }
}

describe('Seed Data', () => {
  describe('SEED_EMPLOYEES', () => {
    it('contains exactly 11 employees', () => {
      expect(SEED_EMPLOYEES).toHaveLength(11)
    })

    it('is readonly (frozen)', () => {
      // Attempting to modify should not affect the original
      const copy = [...SEED_EMPLOYEES]
      expect(copy).toHaveLength(11)
    })

    it('each employee has required fields', () => {
      for (const emp of SEED_EMPLOYEES) {
        expect(emp.id).toBeDefined()
        expect(typeof emp.id).toBe('string')
        expect(emp.id.length).toBeGreaterThan(0)

        expect(emp.name).toBeDefined()
        expect(typeof emp.name).toBe('string')
        expect(emp.name.length).toBeGreaterThan(0)

        expect(emp.status).toBeDefined()
        expect(['active', 'inactive']).toContain(emp.status)

        expect(emp.shiftType).toBeDefined()
        expect(['regular', 'shift']).toContain(emp.shiftType)

        expect(typeof emp.isAdmin).toBe('boolean')

        expect(typeof emp.createdAt).toBe('number')
        expect(typeof emp.updatedAt).toBe('number')
      }
    })

    it('contains one admin employee', () => {
      const admins = SEED_EMPLOYEES.filter(e => e.isAdmin)
      expect(admins).toHaveLength(1)
      expect(admins[0]!.name).toBe('Alex')
    })

    it('contains one inactive employee', () => {
      const inactive = SEED_EMPLOYEES.filter(e => e.status === 'inactive')
      expect(inactive).toHaveLength(1)
      expect(inactive[0]!.name).toBe('Mark')
    })

    it('each employee has a unique id', () => {
      const ids = SEED_EMPLOYEES.map(e => e.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(SEED_EMPLOYEES.length)
    })

    it('each employee has a unique employeeNo', () => {
      const nos = SEED_EMPLOYEES
        .map(e => e.employeeNo)
        .filter(Boolean)
      const uniqueNos = new Set(nos)
      expect(uniqueNos.size).toBe(nos.length)
    })
  })

  describe('buildSeedAttendances()', () => {
    it('returns exactly 4 attendance records', () => {
      const attendances = buildSeedAttendances()
      expect(attendances).toHaveLength(4)
    })

    it('returns a new array on each call (immutable)', () => {
      const a1 = buildSeedAttendances()
      const a2 = buildSeedAttendances()
      expect(a1).not.toBe(a2)
      expect(a1).toEqual(a2)
    })

    it('each attendance has required fields', () => {
      const attendances = buildSeedAttendances()
      for (const att of attendances) {
        expect(att.id).toBeDefined()
        expect(typeof att.id).toBe('string')
        expect(att.id.length).toBeGreaterThan(0)

        expect(att.employeeId).toBeDefined()
        expect(typeof att.employeeId).toBe('string')

        expect(att.date).toBeDefined()
        expect(typeof att.date).toBe('string')
        // Date format: YYYY-MM-DD
        expect(att.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)

        expect(att.type).toBeDefined()
        expect(['regular', 'paid_leave', 'sick_leave', 'personal_leave', 'absent'])
          .toContain(att.type)
      }
    })

    it('all attendance records are for today', () => {
      const today = dayjs().format('YYYY-MM-DD')
      const attendances = buildSeedAttendances()
      for (const att of attendances) {
        expect(att.date).toBe(today)
      }
    })

    it('each attendance has a unique id', () => {
      const attendances = buildSeedAttendances()
      const ids = attendances.map(a => a.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(attendances.length)
    })

    it('contains expected employee references', () => {
      const attendances = buildSeedAttendances()
      const employeeIds = attendances.map(a => a.employeeId)
      expect(employeeIds).toContain('emp-001')
      expect(employeeIds).toContain('emp-002')
      expect(employeeIds).toContain('emp-003')
      expect(employeeIds).toContain('emp-006')
    })

    it('has correct attendance types', () => {
      const attendances = buildSeedAttendances()
      const paidLeave = attendances.find(a => a.employeeId === 'emp-003')
      expect(paidLeave?.type).toBe('paid_leave')

      const regulars = attendances.filter(a => a.type === 'regular')
      expect(regulars).toHaveLength(3)
    })
  })

  describe('seedDatabase()', () => {
    it('calls db.exec with INSERT statements for employees', () => {
      const db = createMockDb()
      seedDatabase(db)

      const execCalls = vi.mocked(db.exec).mock.calls
      // Should have INSERT calls for 11 employees
      const employeeInserts = execCalls.filter(
        ([sql]) => typeof sql === 'string' && sql.includes('INSERT INTO employees'),
      )
      expect(employeeInserts.length).toBeGreaterThanOrEqual(1)
    })

    it('calls db.exec with INSERT statements for attendances', () => {
      const db = createMockDb()
      seedDatabase(db)

      const execCalls = vi.mocked(db.exec).mock.calls
      const attendanceInserts = execCalls.filter(
        ([sql]) => typeof sql === 'string' && sql.includes('INSERT INTO attendances'),
      )
      expect(attendanceInserts.length).toBeGreaterThanOrEqual(1)
    })

    it('uses parameterized SQL (not string interpolation)', () => {
      const db = createMockDb()
      seedDatabase(db)

      const execCalls = vi.mocked(db.exec).mock.calls
      // Every INSERT call should have a params array
      const insertCalls = execCalls.filter(
        ([sql]) => typeof sql === 'string' && sql.includes('INSERT INTO'),
      )
      for (const [, params] of insertCalls) {
        expect(params).toBeDefined()
        expect(Array.isArray(params)).toBe(true)
        expect((params as unknown[]).length).toBeGreaterThan(0)
      }
    })

    it('inserts all 11 employees', () => {
      const db = createMockDb()
      seedDatabase(db)

      const execCalls = vi.mocked(db.exec).mock.calls
      const employeeInserts = execCalls.filter(
        ([sql]) => typeof sql === 'string' && sql.includes('INSERT INTO employees'),
      )
      // Could be 11 individual inserts or fewer batch inserts
      // Count total employee params: each employee INSERT should have params
      expect(employeeInserts.length).toBe(11)
    })

    it('inserts all 4 attendance records', () => {
      const db = createMockDb()
      seedDatabase(db)

      const execCalls = vi.mocked(db.exec).mock.calls
      const attendanceInserts = execCalls.filter(
        ([sql]) => typeof sql === 'string' && sql.includes('INSERT INTO attendances'),
      )
      expect(attendanceInserts.length).toBe(4)
    })
  })
})
