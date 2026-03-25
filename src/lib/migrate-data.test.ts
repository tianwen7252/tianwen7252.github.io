/**
 * Tests for migrateData — V2-55 historical order data migration.
 * Uses a synchronous mock Database (not AsyncDatabase) since migrateData
 * operates directly on the SQLite worker's synchronous db interface.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Database } from '@/lib/database'
import { migrateData } from './migrate-data'

// ─── Mock factory ────────────────────────────────────────────────────────────

function createMockDb(): Database {
  return {
    isReady: true,
    exec: vi.fn((_sql: string, _params?: readonly unknown[]) => ({
      rows: [],
      changes: 0,
    })),
    close: vi.fn(),
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a fake orders row */
function makeOrderRow(
  id: string,
  data: unknown,
): Record<string, unknown> {
  return { id, data: JSON.stringify(data) }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('migrateData()', () => {
  let db: Database

  beforeEach(() => {
    db = createMockDb()
  })

  // 1 ─────────────────────────────────────────────────────────────────────────

  it('does nothing when no orders exist', () => {
    // SELECT unmigrated orders → empty
    vi.mocked(db.exec).mockReturnValueOnce({ rows: [], changes: 0 })

    migrateData(db)

    // Only the initial SELECT call should have been made
    const calls = vi.mocked(db.exec).mock.calls
    expect(calls).toHaveLength(1)
    expect(String(calls[0]![0])).toMatch(/SELECT.+FROM orders/i)
  })

  // 2 ─────────────────────────────────────────────────────────────────────────

  it('returns early when no unmigrated orders exist (all already migrated)', () => {
    // The WHERE NOT EXISTS clause filters out already-migrated orders at the DB level.
    // SELECT returns empty → migrateData returns immediately with no further calls.
    vi.mocked(db.exec).mockReturnValueOnce({ rows: [], changes: 0 })

    migrateData(db)

    const calls = vi.mocked(db.exec).mock.calls
    expect(calls).toHaveLength(1)

    const insertCalls = calls.filter((c) => String(c[0]).includes('INSERT'))
    expect(insertCalls).toHaveLength(0)
  })

  // 3 ─────────────────────────────────────────────────────────────────────────

  it('skips rows with invalid orderId (too long)', () => {
    const longId = 'x'.repeat(200)
    vi.mocked(db.exec).mockReturnValueOnce({
      rows: [{ id: longId, data: JSON.stringify([{ comID: 'c1', value: 'Item', amount: '100' }]) }],
      changes: 0,
    })

    migrateData(db)

    const insertCalls = vi.mocked(db.exec).mock.calls.filter((c) => String(c[0]).includes('INSERT'))
    expect(insertCalls).toHaveLength(0)
  })

  // 4 ─────────────────────────────────────────────────────────────────────────

  it('migrates a single item from legacy data', () => {
    vi.mocked(db.exec)
      // SELECT unmigrated orders → one order
      .mockReturnValueOnce({
        rows: [makeOrderRow('order-001', [{ comID: 'com-001', value: '滷肉便當', amount: '100' }])],
        changes: 0,
      })
      // BEGIN, INSERT order_items, COMMIT → all succeed
      .mockReturnValue({ rows: [], changes: 1 })

    migrateData(db)

    const insertItemCalls = vi
      .mocked(db.exec)
      .mock.calls.filter((c) => String(c[0]).includes('INSERT INTO order_items'))

    expect(insertItemCalls).toHaveLength(1)

    const params = insertItemCalls[0]![1] as unknown[]
    // Params: [id, order_id, commodity_id, name, price, quantity, includes_soup, created_at]
    expect(params[1]).toBe('order-001')        // order_id
    expect(params[2]).toBe('com-001')           // commodity_id (comID)
    expect(params[3]).toBe('滷肉便當')          // name (value)
    expect(params[4]).toBe(100)                 // price (amount as number)
    expect(params[5]).toBe(1)                   // quantity default
    expect(params[6]).toBe(0)                   // includes_soup default 0
  })

  // 5 ─────────────────────────────────────────────────────────────────────────

  it('migrates item with quantity multiplier', () => {
    const data = [
      { comID: 'com-001', value: '滷肉便當', amount: '100' },
      { comID: 'com-001', res: 'qty', operator: '*', amount: '3' },
    ]

    vi.mocked(db.exec)
      .mockReturnValueOnce({ rows: [makeOrderRow('order-001', data)], changes: 0 })
      .mockReturnValue({ rows: [], changes: 1 })

    migrateData(db)

    const insertItemCalls = vi
      .mocked(db.exec)
      .mock.calls.filter((c) => String(c[0]).includes('INSERT INTO order_items'))

    expect(insertItemCalls).toHaveLength(1)

    const params = insertItemCalls[0]![1] as unknown[]
    expect(params[5]).toBe(3) // quantity = 3
  })

  // 5b ────────────────────────────────────────────────────────────────────────

  it('ignores non-positive quantity multiplier (defaults to 1)', () => {
    const data = [
      { comID: 'com-001', value: '滷肉便當', amount: '100' },
      { comID: 'com-001', res: 'qty', operator: '*', amount: '0' }, // invalid qty
    ]

    vi.mocked(db.exec)
      .mockReturnValueOnce({ rows: [makeOrderRow('order-001', data)], changes: 0 })
      .mockReturnValue({ rows: [], changes: 1 })

    migrateData(db)

    const insertItemCalls = vi
      .mocked(db.exec)
      .mock.calls.filter((c) => String(c[0]).includes('INSERT INTO order_items'))

    expect(insertItemCalls).toHaveLength(1)

    const params = insertItemCalls[0]![1] as unknown[]
    expect(params[5]).toBe(1) // quantity defaults to 1 when multiplier is 0
  })

  // 6 ─────────────────────────────────────────────────────────────────────────

  it('migrates a discount from legacy data', () => {
    const data = [{ type: 'discount', res: '會員折扣', operator: '+', amount: '-50' }]

    vi.mocked(db.exec)
      .mockReturnValueOnce({ rows: [makeOrderRow('order-001', data)], changes: 0 })
      .mockReturnValue({ rows: [], changes: 1 })

    migrateData(db)

    const insertDiscountCalls = vi
      .mocked(db.exec)
      .mock.calls.filter((c) => String(c[0]).includes('INSERT INTO order_discounts'))

    expect(insertDiscountCalls).toHaveLength(1)

    const params = insertDiscountCalls[0]![1] as unknown[]
    // Params: [id, order_id, label, amount, created_at]
    expect(params[1]).toBe('order-001') // order_id
    expect(params[2]).toBe('會員折扣')  // label (res)
    expect(params[3]).toBe(50)          // amount as positive value
  })

  // 7 ─────────────────────────────────────────────────────────────────────────

  it('migrates items and discounts together in a transaction', () => {
    const data = [
      { comID: 'com-001', value: '滷肉便當', amount: '100' },
      { type: 'discount', res: '會員折扣', operator: '+', amount: '-50' },
    ]

    vi.mocked(db.exec)
      .mockReturnValueOnce({ rows: [makeOrderRow('order-001', data)], changes: 0 })
      .mockReturnValue({ rows: [], changes: 1 })

    migrateData(db)

    const sqlCalls = vi.mocked(db.exec).mock.calls.map((c) => String(c[0]).trim())

    const beginIdx = sqlCalls.findIndex((s) => s.toUpperCase() === 'BEGIN')
    const commitIdx = sqlCalls.findIndex((s) => s.toUpperCase() === 'COMMIT')
    const insertItemIdx = sqlCalls.findIndex((s) => s.includes('INSERT INTO order_items'))
    const insertDiscountIdx = sqlCalls.findIndex((s) => s.includes('INSERT INTO order_discounts'))

    expect(beginIdx).toBeGreaterThanOrEqual(0)
    expect(commitIdx).toBeGreaterThanOrEqual(0)
    expect(insertItemIdx).toBeGreaterThan(beginIdx)
    expect(insertDiscountIdx).toBeGreaterThan(beginIdx)
    expect(commitIdx).toBeGreaterThan(insertItemIdx)
    expect(commitIdx).toBeGreaterThan(insertDiscountIdx)
  })

  // 8 ─────────────────────────────────────────────────────────────────────────

  it('skips order with empty data array', () => {
    vi.mocked(db.exec).mockReturnValueOnce({ rows: [makeOrderRow('order-001', [])], changes: 0 })

    migrateData(db)

    const insertCalls = vi
      .mocked(db.exec)
      .mock.calls.filter((c) => String(c[0]).includes('INSERT'))
    expect(insertCalls).toHaveLength(0)
  })

  // 9 ─────────────────────────────────────────────────────────────────────────

  it('handles malformed data JSON gracefully', () => {
    vi.mocked(db.exec).mockReturnValueOnce({
      rows: [{ id: 'order-001', data: 'NOT_VALID_JSON{{{' }],
      changes: 0,
    })

    // Should not throw
    expect(() => migrateData(db)).not.toThrow()

    const insertCalls = vi
      .mocked(db.exec)
      .mock.calls.filter((c) => String(c[0]).includes('INSERT'))
    expect(insertCalls).toHaveLength(0)
  })

  // 10 ────────────────────────────────────────────────────────────────────────

  it('migrates multiple orders independently', () => {
    const data1 = [{ comID: 'com-001', value: 'Item A', amount: '80' }]
    const data2 = [{ comID: 'com-002', value: 'Item B', amount: '120' }]

    vi.mocked(db.exec)
      // SELECT unmigrated orders → 2 orders
      .mockReturnValueOnce({
        rows: [makeOrderRow('order-001', data1), makeOrderRow('order-002', data2)],
        changes: 0,
      })
      // BEGIN, INSERT, COMMIT for order-001
      .mockReturnValueOnce({ rows: [], changes: 1 }) // BEGIN
      .mockReturnValueOnce({ rows: [], changes: 1 }) // INSERT order_items
      .mockReturnValueOnce({ rows: [], changes: 1 }) // COMMIT
      // BEGIN, INSERT, COMMIT for order-002
      .mockReturnValue({ rows: [], changes: 1 })

    migrateData(db)

    const insertItemCalls = vi
      .mocked(db.exec)
      .mock.calls.filter((c) => String(c[0]).includes('INSERT INTO order_items'))

    expect(insertItemCalls).toHaveLength(2)

    // Verify each insert has the correct order_id
    const firstParams = insertItemCalls[0]![1] as unknown[]
    const secondParams = insertItemCalls[1]![1] as unknown[]
    expect(firstParams[1]).toBe('order-001')
    expect(secondParams[1]).toBe('order-002')
  })

  // 11 ────────────────────────────────────────────────────────────────────────

  it('rolls back transaction on INSERT failure and continues to next order', () => {
    const data1 = [{ comID: 'com-001', value: '滷肉便當', amount: '100' }]
    const data2 = [{ comID: 'com-002', value: '排骨便當', amount: '110' }]

    vi.mocked(db.exec)
      // SELECT → 2 orders
      .mockReturnValueOnce({
        rows: [makeOrderRow('order-001', data1), makeOrderRow('order-002', data2)],
        changes: 0,
      })
      // order-001: BEGIN
      .mockReturnValueOnce({ rows: [], changes: 0 })
      // order-001: INSERT throws
      .mockImplementationOnce(() => {
        throw new Error('SQLITE_CONSTRAINT: disk full')
      })
      // ROLLBACK and order-002 proceed normally
      .mockReturnValue({ rows: [], changes: 1 })

    // Should not propagate the error
    expect(() => migrateData(db)).not.toThrow()

    const sqlCalls = vi.mocked(db.exec).mock.calls.map((c) => String(c[0]).trim().toUpperCase())
    expect(sqlCalls).toContain('ROLLBACK')

    // Verify order-002 was still migrated after order-001 failed.
    // order-001's INSERT is in mock.calls (it threw mid-call), so there are 2 total INSERT calls.
    const insertItemCalls = vi
      .mocked(db.exec)
      .mock.calls.filter((c) => String(c[0]).includes('INSERT INTO order_items'))
    expect(insertItemCalls).toHaveLength(2) // order-001 attempted, order-002 succeeded
    const order002Params = insertItemCalls[1]![1] as unknown[]
    expect(order002Params[1]).toBe('order-002')
  })

  // 12 ────────────────────────────────────────────────────────────────────────

  it('truncates name and label that exceed max length', () => {
    const longName = 'A'.repeat(600)
    const longLabel = 'B'.repeat(300)
    const data = [
      { comID: 'com-001', value: longName, amount: '100' },
      { type: 'discount', res: longLabel, amount: '-50' },
    ]

    vi.mocked(db.exec)
      .mockReturnValueOnce({ rows: [makeOrderRow('order-001', data)], changes: 0 })
      .mockReturnValue({ rows: [], changes: 1 })

    migrateData(db)

    const insertItemCalls = vi
      .mocked(db.exec)
      .mock.calls.filter((c) => String(c[0]).includes('INSERT INTO order_items'))
    const insertDiscountCalls = vi
      .mocked(db.exec)
      .mock.calls.filter((c) => String(c[0]).includes('INSERT INTO order_discounts'))

    expect(insertItemCalls).toHaveLength(1)
    expect(insertDiscountCalls).toHaveLength(1)

    const itemParams = insertItemCalls[0]![1] as unknown[]
    const discountParams = insertDiscountCalls[0]![1] as unknown[]
    expect((itemParams[3] as string).length).toBe(512)    // name truncated to 512
    expect((discountParams[2] as string).length).toBe(256) // label truncated to 256
  })
})
