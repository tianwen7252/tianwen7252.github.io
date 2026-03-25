/**
 * Tests for StatisticsRepository.
 * Uses a mock AsyncDatabase since SQLite WASM cannot run in Node/Vitest.
 * Focuses on correct SQL call patterns and return value mapping.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AsyncDatabase } from '@/lib/worker-database'
import { createStatisticsRepository } from './statistics-repository'
import type { DateRange } from './statistics-repository'

// ─── Mock DB factory ─────────────────────────────────────────────────────────

function createMockDb(): AsyncDatabase {
  return {
    exec: vi.fn(async () => ({ rows: [], changes: 0 })),
  }
}

// ─── Test fixtures ────────────────────────────────────────────────────────────

const range: DateRange = {
  startDate: new Date('2026-03-01').getTime(),
  endDate: new Date('2026-03-31T23:59:59.999').getTime(),
}

// ─── getProductKpis ──────────────────────────────────────────────────────────

describe('StatisticsRepository.getProductKpis()', () => {
  let db: AsyncDatabase

  beforeEach(() => {
    db = createMockDb()
  })

  it('returns zero values when DB returns no rows', async () => {
    const repo = createStatisticsRepository(db)
    const result = await repo.getProductKpis(range)
    expect(result).toEqual({
      totalRevenue: 0,
      orderCount: 0,
      morningRevenue: 0,
      afternoonRevenue: 0,
      totalQuantity: 0,
      bentoQuantity: 0,
    })
  })

  it('maps DB row to ProductKpis correctly', async () => {
    vi.mocked(db.exec).mockResolvedValueOnce({
      rows: [{
        total_revenue: 15000,
        order_count: 25,
        morning_revenue: 8000,
        afternoon_revenue: 7000,
        total_quantity: 80,
        bento_quantity: 50,
      }],
      changes: 0,
    })

    const repo = createStatisticsRepository(db)
    const result = await repo.getProductKpis(range)
    expect(result).toEqual({
      totalRevenue: 15000,
      orderCount: 25,
      morningRevenue: 8000,
      afternoonRevenue: 7000,
      totalQuantity: 80,
      bentoQuantity: 50,
    })
  })

  it('calls db.exec with startDate and endDate params', async () => {
    const repo = createStatisticsRepository(db)
    await repo.getProductKpis(range)
    const [, params] = vi.mocked(db.exec).mock.calls[0]!
    expect(params).toContain(range.startDate)
    expect(params).toContain(range.endDate)
  })
})

// ─── getHourlyOrderDistribution ──────────────────────────────────────────────

describe('StatisticsRepository.getHourlyOrderDistribution()', () => {
  let db: AsyncDatabase

  beforeEach(() => {
    db = createMockDb()
  })

  it('returns exactly 24 buckets even when DB returns empty', async () => {
    const repo = createStatisticsRepository(db)
    const result = await repo.getHourlyOrderDistribution(range)
    expect(result).toHaveLength(24)
  })

  it('buckets are ordered 0–23', async () => {
    const repo = createStatisticsRepository(db)
    const result = await repo.getHourlyOrderDistribution(range)
    result.forEach((b, i) => expect(b.hour).toBe(i))
  })

  it('fills missing hours with count 0', async () => {
    vi.mocked(db.exec).mockResolvedValueOnce({
      rows: [{ hour: 9, count: 15 }, { hour: 14, count: 30 }],
      changes: 0,
    })
    const repo = createStatisticsRepository(db)
    const result = await repo.getHourlyOrderDistribution(range)
    expect(result[0]!.count).toBe(0)
    expect(result[9]!.count).toBe(15)
    expect(result[14]!.count).toBe(30)
    expect(result[23]!.count).toBe(0)
  })

  it('passes date range params to db.exec', async () => {
    const repo = createStatisticsRepository(db)
    await repo.getHourlyOrderDistribution(range)
    const [, params] = vi.mocked(db.exec).mock.calls[0]!
    expect(params).toContain(range.startDate)
    expect(params).toContain(range.endDate)
  })
})

// ─── getTopProducts ───────────────────────────────────────────────────────────

describe('StatisticsRepository.getTopProducts()', () => {
  let db: AsyncDatabase

  beforeEach(() => {
    db = createMockDb()
  })

  it('returns empty array when DB returns no rows', async () => {
    const repo = createStatisticsRepository(db)
    const result = await repo.getTopProducts(range, 5, 'quantity')
    expect(result).toEqual([])
  })

  it('maps DB rows to ProductRanking correctly', async () => {
    vi.mocked(db.exec).mockResolvedValueOnce({
      rows: [
        { commodity_id: 'com-1', name: '招牌便當', quantity: 30, revenue: 4500 },
        { commodity_id: 'com-2', name: '排骨便當', quantity: 25, revenue: 3750 },
      ],
      changes: 0,
    })
    const repo = createStatisticsRepository(db)
    const result = await repo.getTopProducts(range, 5, 'quantity')
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ comId: 'com-1', name: '招牌便當', quantity: 30, revenue: 4500 })
    expect(result[1]).toEqual({ comId: 'com-2', name: '排骨便當', quantity: 25, revenue: 3750 })
  })

  it('passes the limit param to db.exec', async () => {
    const repo = createStatisticsRepository(db)
    await repo.getTopProducts(range, 10, 'revenue')
    const [, params] = vi.mocked(db.exec).mock.calls[0]!
    expect(params).toContain(10)
  })
})

// ─── getBottomBentos ──────────────────────────────────────────────────────────

describe('StatisticsRepository.getBottomBentos()', () => {
  let db: AsyncDatabase

  beforeEach(() => {
    db = createMockDb()
  })

  it('returns empty array when no rows', async () => {
    const repo = createStatisticsRepository(db)
    const result = await repo.getBottomBentos(range, 5)
    expect(result).toEqual([])
  })

  it('maps rows correctly', async () => {
    vi.mocked(db.exec).mockResolvedValueOnce({
      rows: [{ commodity_id: 'com-5', name: '素食便當', quantity: 1, revenue: 150 }],
      changes: 0,
    })
    const repo = createStatisticsRepository(db)
    const result = await repo.getBottomBentos(range, 5)
    expect(result[0]).toEqual({ comId: 'com-5', name: '素食便當', quantity: 1, revenue: 150 })
  })
})

// ─── getDailyRevenue ──────────────────────────────────────────────────────────

describe('StatisticsRepository.getDailyRevenue()', () => {
  let db: AsyncDatabase

  beforeEach(() => {
    db = createMockDb()
  })

  it('returns empty array when no rows', async () => {
    const repo = createStatisticsRepository(db)
    const result = await repo.getDailyRevenue(range)
    expect(result).toEqual([])
  })

  it('maps DB rows to DailyRevenue correctly', async () => {
    vi.mocked(db.exec).mockResolvedValueOnce({
      rows: [
        { date: '2026-03-01', revenue: 3500 },
        { date: '2026-03-02', revenue: 4200 },
      ],
      changes: 0,
    })
    const repo = createStatisticsRepository(db)
    const result = await repo.getDailyRevenue(range)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ date: '2026-03-01', revenue: 3500 })
    expect(result[1]).toEqual({ date: '2026-03-02', revenue: 4200 })
  })
})

// ─── getAvgOrderValue ─────────────────────────────────────────────────────────

describe('StatisticsRepository.getAvgOrderValue()', () => {
  let db: AsyncDatabase

  beforeEach(() => {
    db = createMockDb()
  })

  it('returns empty array when no rows', async () => {
    const repo = createStatisticsRepository(db)
    const result = await repo.getAvgOrderValue(range)
    expect(result).toEqual([])
  })

  it('maps DB rows to DailyRevenue (revenue = avg per day)', async () => {
    vi.mocked(db.exec).mockResolvedValueOnce({
      rows: [
        { date: '2026-03-01', revenue: 140 },
      ],
      changes: 0,
    })
    const repo = createStatisticsRepository(db)
    const result = await repo.getAvgOrderValue(range)
    expect(result[0]).toEqual({ date: '2026-03-01', revenue: 140 })
  })
})

// ─── getStaffKpis ─────────────────────────────────────────────────────────────

describe('StatisticsRepository.getStaffKpis()', () => {
  let db: AsyncDatabase

  beforeEach(() => {
    db = createMockDb()
  })

  it('returns zero values when DB returns empty', async () => {
    const repo = createStatisticsRepository(db)
    const result = await repo.getStaffKpis(range)
    expect(result).toEqual({
      activeEmployeeCount: 0,
      totalAttendanceDays: 0,
      avgMonthlyHours: 0,
      leaveCount: 0,
    })
  })

  it('maps DB rows to StaffKpis correctly', async () => {
    vi.mocked(db.exec)
      // First call: employee count
      .mockResolvedValueOnce({ rows: [{ count: 8 }], changes: 0 })
      // Second call: attendance days
      .mockResolvedValueOnce({ rows: [{ count: 22 }], changes: 0 })
      // Third call: avg hours
      .mockResolvedValueOnce({ rows: [{ avg_hours: 7.5 }], changes: 0 })
      // Fourth call: leave count
      .mockResolvedValueOnce({ rows: [{ count: 3 }], changes: 0 })

    const repo = createStatisticsRepository(db)
    const result = await repo.getStaffKpis(range)
    expect(result.activeEmployeeCount).toBe(8)
    expect(result.totalAttendanceDays).toBe(22)
    expect(result.avgMonthlyHours).toBe(7.5)
    expect(result.leaveCount).toBe(3)
  })
})

// ─── getEmployeeHours ─────────────────────────────────────────────────────────

describe('StatisticsRepository.getEmployeeHours()', () => {
  let db: AsyncDatabase

  beforeEach(() => {
    db = createMockDb()
  })

  it('returns empty array when no rows', async () => {
    const repo = createStatisticsRepository(db)
    const result = await repo.getEmployeeHours(range)
    expect(result).toEqual([])
  })

  it('maps DB rows to EmployeeHours correctly', async () => {
    vi.mocked(db.exec).mockResolvedValueOnce({
      rows: [{
        employee_id: 'emp-001',
        employee_name: 'Alice',
        regular: 160,
        paid_leave: 8,
        sick_leave: 0,
        personal_leave: 4,
        absent: 0,
      }],
      changes: 0,
    })
    const repo = createStatisticsRepository(db)
    const result = await repo.getEmployeeHours(range)
    expect(result[0]).toEqual({
      employeeId: 'emp-001',
      employeeName: 'Alice',
      regular: 160,
      paidLeave: 8,
      sickLeave: 0,
      personalLeave: 4,
      absent: 0,
    })
  })
})

// ─── getDailyHeadcount ────────────────────────────────────────────────────────

describe('StatisticsRepository.getDailyHeadcount()', () => {
  let db: AsyncDatabase

  beforeEach(() => {
    db = createMockDb()
  })

  it('returns empty array when no rows', async () => {
    const repo = createStatisticsRepository(db)
    const result = await repo.getDailyHeadcount(range)
    expect(result).toEqual([])
  })

  it('maps DB rows to DailyHeadcount correctly', async () => {
    vi.mocked(db.exec).mockResolvedValueOnce({
      rows: [
        { date: '2026-03-01', count: 5 },
        { date: '2026-03-02', count: 4 },
      ],
      changes: 0,
    })
    const repo = createStatisticsRepository(db)
    const result = await repo.getDailyHeadcount(range)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ date: '2026-03-01', count: 5 })
    expect(result[1]).toEqual({ date: '2026-03-02', count: 4 })
  })
})

// ─── getDailyAttendeeList ─────────────────────────────────────────────────────

describe('StatisticsRepository.getDailyAttendeeList()', () => {
  let db: AsyncDatabase

  beforeEach(() => {
    db = createMockDb()
  })

  it('returns empty array when no rows', async () => {
    const repo = createStatisticsRepository(db)
    const result = await repo.getDailyAttendeeList('2026-03-01')
    expect(result).toEqual([])
  })

  it('returns employee names for the given date', async () => {
    vi.mocked(db.exec).mockResolvedValueOnce({
      rows: [
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Charlie' },
      ],
      changes: 0,
    })
    const repo = createStatisticsRepository(db)
    const result = await repo.getDailyAttendeeList('2026-03-01')
    expect(result).toEqual(['Alice', 'Bob', 'Charlie'])
  })

  it('passes the date string to db.exec', async () => {
    const repo = createStatisticsRepository(db)
    await repo.getDailyAttendeeList('2026-03-15')
    const [, params] = vi.mocked(db.exec).mock.calls[0]!
    expect(params).toContain('2026-03-15')
  })
})
