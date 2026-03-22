/**
 * Tests for AttendanceRepository, focused on the new findByMonth method.
 * Uses a mock Database since SQLite WASM cannot run in Node/Vitest.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Database } from '@/lib/database'
import { createAttendanceRepository } from './attendance-repository'

function createMockDb(): Database {
  return {
    isReady: true,
    exec: vi.fn(() => ({ rows: [], changes: 0 })),
    close: vi.fn(),
  }
}

describe('AttendanceRepository', () => {
  describe('findByMonth()', () => {
    let db: Database

    beforeEach(() => {
      db = createMockDb()
    })

    it('calls db.exec with correct SQL and LIKE param for single-digit month', () => {
      const repo = createAttendanceRepository(db)
      repo.findByMonth(2026, 3)

      expect(db.exec).toHaveBeenCalledWith(
        'SELECT * FROM attendances WHERE date LIKE ? ORDER BY date DESC',
        ['2026-03%'],
      )
    })

    it('calls db.exec with correct SQL and LIKE param for double-digit month', () => {
      const repo = createAttendanceRepository(db)
      repo.findByMonth(2026, 12)

      expect(db.exec).toHaveBeenCalledWith(
        'SELECT * FROM attendances WHERE date LIKE ? ORDER BY date DESC',
        ['2026-12%'],
      )
    })

    it('pads single-digit month to two digits', () => {
      const repo = createAttendanceRepository(db)
      repo.findByMonth(2025, 1)

      const call = vi.mocked(db.exec).mock.calls[0]
      expect(call![1]).toEqual(['2025-01%'])
    })

    it('returns empty array when no rows match', () => {
      const repo = createAttendanceRepository(db)
      const result = repo.findByMonth(2026, 3)

      expect(result).toEqual([])
    })

    it('maps rows to Attendance objects', () => {
      const mockRows = [
        {
          id: 'att-100',
          employee_id: 'emp-001',
          date: '2026-03-15',
          clock_in: 1742018400000,
          clock_out: 1742050800000,
          type: 'regular',
        },
        {
          id: 'att-101',
          employee_id: 'emp-002',
          date: '2026-03-10',
          clock_in: 1741586400000,
          clock_out: null,
          type: 'paid_leave',
        },
      ]

      vi.mocked(db.exec).mockReturnValueOnce({
        rows: mockRows,
        changes: 0,
      })

      const repo = createAttendanceRepository(db)
      const result = repo.findByMonth(2026, 3)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: 'att-100',
        employeeId: 'emp-001',
        date: '2026-03-15',
        clockIn: 1742018400000,
        clockOut: 1742050800000,
        type: 'regular',
      })
      expect(result[1]).toEqual({
        id: 'att-101',
        employeeId: 'emp-002',
        date: '2026-03-10',
        clockIn: 1741586400000,
        clockOut: undefined,
        type: 'paid_leave',
      })
    })

    it('handles year boundary correctly (January)', () => {
      const repo = createAttendanceRepository(db)
      repo.findByMonth(2027, 1)

      expect(db.exec).toHaveBeenCalledWith(
        'SELECT * FROM attendances WHERE date LIKE ? ORDER BY date DESC',
        ['2027-01%'],
      )
    })

    it('handles year boundary correctly (December)', () => {
      const repo = createAttendanceRepository(db)
      repo.findByMonth(2025, 12)

      expect(db.exec).toHaveBeenCalledWith(
        'SELECT * FROM attendances WHERE date LIKE ? ORDER BY date DESC',
        ['2025-12%'],
      )
    })
  })
})
