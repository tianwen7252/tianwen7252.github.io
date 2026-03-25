/**
 * Tests for default-data module.
 * Covers localStorage version check, data deletion, clearing, and insertion functions.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  shouldResetDefaultData,
  markDefaultDataVersion,
  deleteDefaultData,
  clearAllData,
  insertDefaultEmployees,
  insertDefaultCommodities,
  DEFAULT_EMPLOYEES,
  DEFAULT_COMMODITY_TYPES,
  DEFAULT_COMMODITIES,
} from './default-data'
import { UPDATE_DEFAULT_DATA_NUMBER } from '@/constants/default-data'
import type { Database, QueryResult } from '@/lib/database'

// ─── Mock Database factory ───────────────────────────────────────────────────

function makeMockDb(): Database & { calls: Array<{ sql: string; params: readonly unknown[] }> } {
  const calls: Array<{ sql: string; params: readonly unknown[] }> = []
  return {
    isReady: true,
    calls,
    exec(sql: string, params?: readonly unknown[]) {
      calls.push({ sql: sql.trim(), params: params ?? [] })
      return { rows: [], changes: 0 }
    },
    close() {},
  }
}

// ─── shouldResetDefaultData ──────────────────────────────────────────────────

describe('shouldResetDefaultData()', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns true when localStorage has no stored version', () => {
    expect(shouldResetDefaultData()).toBe(true)
  })

  it('returns true when stored version differs from constant', () => {
    localStorage.setItem('UPDATE_DEFAULT_DATA_NUMBER', String(UPDATE_DEFAULT_DATA_NUMBER - 1))
    expect(shouldResetDefaultData()).toBe(true)
  })

  it('returns false when stored version matches constant', () => {
    localStorage.setItem('UPDATE_DEFAULT_DATA_NUMBER', String(UPDATE_DEFAULT_DATA_NUMBER))
    expect(shouldResetDefaultData()).toBe(false)
  })

  it('returns true when stored version is a future number (mismatch)', () => {
    localStorage.setItem('UPDATE_DEFAULT_DATA_NUMBER', String(UPDATE_DEFAULT_DATA_NUMBER + 99))
    expect(shouldResetDefaultData()).toBe(true)
  })

  it('returns true when stored value is empty string', () => {
    localStorage.setItem('UPDATE_DEFAULT_DATA_NUMBER', '')
    expect(shouldResetDefaultData()).toBe(true)
  })
})

// ─── markDefaultDataVersion ──────────────────────────────────────────────────

describe('markDefaultDataVersion()', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('stores the current UPDATE_DEFAULT_DATA_NUMBER in localStorage', () => {
    markDefaultDataVersion()
    const stored = localStorage.getItem('UPDATE_DEFAULT_DATA_NUMBER')
    expect(stored).toBe(String(UPDATE_DEFAULT_DATA_NUMBER))
  })

  it('after marking, shouldResetDefaultData returns false', () => {
    markDefaultDataVersion()
    expect(shouldResetDefaultData()).toBe(false)
  })

  it('overwrites any previously stored value', () => {
    localStorage.setItem('UPDATE_DEFAULT_DATA_NUMBER', '999')
    markDefaultDataVersion()
    const stored = localStorage.getItem('UPDATE_DEFAULT_DATA_NUMBER')
    expect(stored).toBe(String(UPDATE_DEFAULT_DATA_NUMBER))
  })
})

// ─── deleteDefaultData ───────────────────────────────────────────────────────

describe('deleteDefaultData(db)', () => {
  it('issues SELECT COUNT to check for non-default commondities before deleting commondity_types', () => {
    const db = makeMockDb()
    deleteDefaultData(db)

    const selectCall = db.calls.find(
      (c) => c.sql.includes('SELECT COUNT') && c.sql.includes('commondities'),
    )
    expect(selectCall).toBeDefined()
    expect(selectCall!.sql).toMatch(/SELECT COUNT\(\*\) as cnt FROM commondities WHERE type_id IN/)
    expect(selectCall!.params).toHaveLength(4) // 4 default typeId values
  })

  it('issues DELETE for commondity_types when SELECT COUNT returns 0', () => {
    // Default mock returns rows:[] which means cnt=undefined→0, so deletion proceeds
    const db = makeMockDb()
    deleteDefaultData(db)

    const typesSql = db.calls.find((c) => c.sql.includes('DELETE FROM commondity_types'))
    expect(typesSql).toBeDefined()
    expect(typesSql!.sql).toMatch(/DELETE FROM commondity_types WHERE id IN/)
  })

  it('skips DELETE for commondity_types when non-default commondities still reference them', () => {
    const calls: Array<{ sql: string; params: readonly unknown[] }> = []
    const mockDb: Database & { calls: typeof calls } = {
      isReady: true,
      calls,
      exec<T = Record<string, unknown>>(sql: string, params?: readonly unknown[]): QueryResult<T> {
        calls.push({ sql: sql.trim(), params: params ?? [] })
        // Simulate COUNT(*) returning 2 (user has custom commondities)
        if (sql.includes('SELECT COUNT') && sql.includes('commondities')) {
          return { rows: [{ cnt: 2 }] as unknown as readonly T[], changes: 0 }
        }
        return { rows: [] as readonly T[], changes: 0 }
      },
      close() {},
    }
    deleteDefaultData(mockDb)

    const typesSql = calls.find((c) => c.sql.includes('DELETE FROM commondity_types'))
    expect(typesSql).toBeUndefined()
  })

  it('issues DELETE for commondities using default commodity IDs', () => {
    const db = makeMockDb()
    deleteDefaultData(db)

    const comSql = db.calls.find((c) => c.sql.includes('commondities') && !c.sql.includes('commondity_types'))
    expect(comSql).toBeDefined()
    expect(comSql!.sql).toMatch(/DELETE FROM commondities WHERE id IN/)
  })

  it('issues DELETE for employees using default employee IDs', () => {
    const db = makeMockDb()
    deleteDefaultData(db)

    const empSql = db.calls.find((c) => c.sql.includes('employees'))
    expect(empSql).toBeDefined()
    expect(empSql!.sql).toMatch(/DELETE FROM employees WHERE id IN/)
  })

  it('uses parameterized queries (no IDs embedded in SQL string)', () => {
    const db = makeMockDb()
    deleteDefaultData(db)

    for (const call of db.calls) {
      // IDs like 'ct-001' or 'emp-001' should not appear directly in SQL
      expect(call.sql).not.toMatch(/ct-\d+|emp-\d+|com-\d+/)
    }
  })

  it('passes correct number of params for each DELETE', () => {
    const db = makeMockDb()
    deleteDefaultData(db)

    // Verify param counts match the known seed data sizes
    const empCall = db.calls.find((c) => c.sql.includes('DELETE FROM employees'))
    expect(empCall!.params).toHaveLength(11) // EMPLOYEE_SEEDS has 11 entries

    const typesCall = db.calls.find((c) => c.sql.includes('DELETE FROM commondity_types'))
    expect(typesCall!.params).toHaveLength(4) // COMMODITY_TYPE_SEEDS has 4 entries

    const comCall = db.calls.find((c) => c.sql.includes('DELETE FROM commondities') && !c.sql.includes('commondity_types'))
    expect(comCall!.params).toHaveLength(46) // COMMODITY_SEEDS has 46 entries
  })

  it('deletes commondities before SELECT-checking and deleting commondity_types', () => {
    const db = makeMockDb()
    deleteDefaultData(db)

    const comIdx = db.calls.findIndex(
      (c) => c.sql.includes('DELETE FROM commondities') && !c.sql.includes('commondity_types'),
    )
    const selectIdx = db.calls.findIndex(
      (c) => c.sql.includes('SELECT COUNT') && c.sql.includes('commondities'),
    )
    const typesIdx = db.calls.findIndex((c) => c.sql.includes('DELETE FROM commondity_types'))
    expect(comIdx).toBeLessThan(selectIdx)
    expect(selectIdx).toBeLessThan(typesIdx)
  })

  it('deletes attendances for default employees before deleting employees to respect FK constraint', () => {
    const db = makeMockDb()
    deleteDefaultData(db)

    const attIdx = db.calls.findIndex((c) => c.sql.includes('DELETE FROM attendances'))
    const empIdx = db.calls.findIndex((c) => c.sql.includes('DELETE FROM employees'))
    expect(attIdx).toBeGreaterThanOrEqual(0)
    expect(attIdx).toBeLessThan(empIdx)
  })

  it('issues DELETE for attendances with employee_id filter using default employee IDs', () => {
    const db = makeMockDb()
    deleteDefaultData(db)

    const attCall = db.calls.find((c) => c.sql.includes('DELETE FROM attendances'))
    expect(attCall).toBeDefined()
    expect(attCall!.sql).toMatch(/DELETE FROM attendances WHERE employee_id IN/)
    expect(attCall!.params).toHaveLength(11)
  })
})

// ─── clearAllData ────────────────────────────────────────────────────────────

describe('clearAllData(db)', () => {
  it('deletes from attendances table', () => {
    const db = makeMockDb()
    clearAllData(db)

    expect(db.calls.some((c) => c.sql === 'DELETE FROM attendances')).toBe(true)
  })

  it('deletes from commondities table', () => {
    const db = makeMockDb()
    clearAllData(db)

    expect(db.calls.some((c) => c.sql === 'DELETE FROM commondities')).toBe(true)
  })

  it('deletes from commondity_types table', () => {
    const db = makeMockDb()
    clearAllData(db)

    expect(db.calls.some((c) => c.sql === 'DELETE FROM commondity_types')).toBe(true)
  })

  it('deletes from employees table', () => {
    const db = makeMockDb()
    clearAllData(db)

    expect(db.calls.some((c) => c.sql === 'DELETE FROM employees')).toBe(true)
  })

  it('deletes from orders table', () => {
    const db = makeMockDb()
    clearAllData(db)

    expect(db.calls.some((c) => c.sql === 'DELETE FROM orders')).toBe(true)
  })

  it('deletes from order_types table', () => {
    const db = makeMockDb()
    clearAllData(db)

    expect(db.calls.some((c) => c.sql === 'DELETE FROM order_types')).toBe(true)
  })

  it('deletes from daily_data table', () => {
    const db = makeMockDb()
    clearAllData(db)

    expect(db.calls.some((c) => c.sql === 'DELETE FROM daily_data')).toBe(true)
  })

  it('deletes from order_items table', () => {
    const db = makeMockDb()
    clearAllData(db)

    expect(db.calls.some((c) => c.sql === 'DELETE FROM order_items')).toBe(true)
  })

  it('deletes from order_discounts table', () => {
    const db = makeMockDb()
    clearAllData(db)

    expect(db.calls.some((c) => c.sql === 'DELETE FROM order_discounts')).toBe(true)
  })

  it('issues exactly 9 DELETE statements', () => {
    const db = makeMockDb()
    clearAllData(db)

    const deletes = db.calls.filter((c) => c.sql.startsWith('DELETE'))
    expect(deletes).toHaveLength(9)
  })

  it('deletes order_items before orders to respect FK constraint', () => {
    const db = makeMockDb()
    clearAllData(db)

    const itemsIdx = db.calls.findIndex((c) => c.sql === 'DELETE FROM order_items')
    const ordersIdx = db.calls.findIndex((c) => c.sql === 'DELETE FROM orders')
    expect(itemsIdx).toBeLessThan(ordersIdx)
  })

  it('deletes order_discounts before orders to respect FK constraint', () => {
    const db = makeMockDb()
    clearAllData(db)

    const discountsIdx = db.calls.findIndex((c) => c.sql === 'DELETE FROM order_discounts')
    const ordersIdx = db.calls.findIndex((c) => c.sql === 'DELETE FROM orders')
    expect(discountsIdx).toBeLessThan(ordersIdx)
  })
})

// ─── insertDefaultEmployees ──────────────────────────────────────────────────

describe('insertDefaultEmployees(db)', () => {
  it('inserts all 11 employees', () => {
    const db = makeMockDb()
    insertDefaultEmployees(db)

    const inserts = db.calls.filter((c) => c.sql.includes('INSERT') && c.sql.includes('employees'))
    expect(inserts).toHaveLength(11)
  })

  it('uses INSERT OR IGNORE to avoid duplicates', () => {
    const db = makeMockDb()
    insertDefaultEmployees(db)

    const inserts = db.calls.filter((c) => c.sql.includes('employees'))
    for (const call of inserts) {
      expect(call.sql).toMatch(/INSERT OR IGNORE INTO employees/)
    }
  })

  it('passes all required employee fields as params', () => {
    const db = makeMockDb()
    insertDefaultEmployees(db)

    const first = db.calls.find((c) => c.sql.includes('employees'))
    // Expected: id, name, avatar, status, shift_type, employee_no, is_admin, hire_date, resignation_date, created_at, updated_at
    expect(first!.params).toHaveLength(11)
  })

  it('does not mutate DEFAULT_EMPLOYEES array', () => {
    const db = makeMockDb()
    const originalLength = DEFAULT_EMPLOYEES.length
    insertDefaultEmployees(db)
    expect(DEFAULT_EMPLOYEES).toHaveLength(originalLength)
  })

  it('converts isAdmin boolean to 1/0 integer', () => {
    const db = makeMockDb()
    insertDefaultEmployees(db)

    // First employee (emp-001) is admin = true, should be 1
    const first = db.calls.find((c) => c.sql.includes('employees'))
    const isAdminParam = first!.params[6] // index 6: is_admin
    expect(isAdminParam).toBe(1)
  })
})

// ─── insertDefaultCommodities ────────────────────────────────────────────────

describe('insertDefaultCommodities(db)', () => {
  it('inserts all 4 commodity types', () => {
    const db = makeMockDb()
    insertDefaultCommodities(db)

    const typeInserts = db.calls.filter(
      (c) => c.sql.includes('INSERT') && c.sql.includes('commondity_types'),
    )
    expect(typeInserts).toHaveLength(4)
  })

  it('inserts all 46 commodities', () => {
    const db = makeMockDb()
    insertDefaultCommodities(db)

    const comInserts = db.calls.filter(
      (c) =>
        c.sql.includes('INSERT') &&
        c.sql.includes('commondities') &&
        !c.sql.includes('commondity_types'),
    )
    expect(comInserts).toHaveLength(46)
  })

  it('uses INSERT OR IGNORE for commodity types', () => {
    const db = makeMockDb()
    insertDefaultCommodities(db)

    const typeInserts = db.calls.filter((c) => c.sql.includes('commondity_types'))
    for (const call of typeInserts) {
      expect(call.sql).toMatch(/INSERT OR IGNORE INTO commondity_types/)
    }
  })

  it('uses INSERT OR IGNORE for commodities', () => {
    const db = makeMockDb()
    insertDefaultCommodities(db)

    const comInserts = db.calls.filter(
      (c) => c.sql.includes('commondities') && !c.sql.includes('commondity_types'),
    )
    for (const call of comInserts) {
      expect(call.sql).toMatch(/INSERT OR IGNORE INTO commondities/)
    }
  })

  it('does not mutate DEFAULT_COMMODITY_TYPES or DEFAULT_COMMODITIES arrays', () => {
    const db = makeMockDb()
    const origTypesLen = DEFAULT_COMMODITY_TYPES.length
    const origComLen = DEFAULT_COMMODITIES.length
    insertDefaultCommodities(db)
    expect(DEFAULT_COMMODITY_TYPES).toHaveLength(origTypesLen)
    expect(DEFAULT_COMMODITIES).toHaveLength(origComLen)
  })

  it('converts onMarket boolean to 1/0 integer for commodities', () => {
    const db = makeMockDb()
    insertDefaultCommodities(db)

    const comInserts = db.calls.filter(
      (c) => c.sql.includes('INSERT') && c.sql.includes('commondities') && !c.sql.includes('commondity_types'),
    )
    // on_market should be 1 (all default commodities are on market)
    for (const call of comInserts) {
      const onMarketParam = call.params[6] // index 6: on_market
      expect(onMarketParam).toBe(1)
    }
  })

  it('includes includes_soup column in commodity INSERT SQL', () => {
    const db = makeMockDb()
    insertDefaultCommodities(db)

    const comInserts = db.calls.filter(
      (c) => c.sql.includes('INSERT') && c.sql.includes('commondities') && !c.sql.includes('commondity_types'),
    )
    for (const call of comInserts) {
      expect(call.sql).toMatch(/includes_soup/)
    }
  })

  it('passes includes_soup as 1 for com-001 through com-014 (rice bentos)', () => {
    const db = makeMockDb()
    insertDefaultCommodities(db)

    const comInserts = db.calls.filter(
      (c) => c.sql.includes('INSERT') && c.sql.includes('commondities') && !c.sql.includes('commondity_types'),
    )
    // First 14 inserts are the rice bentos (com-001 to com-014)
    for (let i = 0; i < 14; i++) {
      // includes_soup is at index 9 (after editor at index 8)
      const includesSoupParam = comInserts[i]!.params[9]
      expect(includesSoupParam).toBe(1)
    }
  })

  it('passes includes_soup as 0 for com-015 (雞胸肉沙拉, no rice)', () => {
    const db = makeMockDb()
    insertDefaultCommodities(db)

    const comInserts = db.calls.filter(
      (c) => c.sql.includes('INSERT') && c.sql.includes('commondities') && !c.sql.includes('commondity_types'),
    )
    // com-015 is the 15th commodity insert
    const com015Insert = comInserts[14]
    const includesSoupParam = com015Insert!.params[9]
    expect(includesSoupParam).toBe(0)
  })
})

// ─── Exported data arrays ────────────────────────────────────────────────────

describe('DEFAULT_EMPLOYEES', () => {
  it('has 11 employees', () => {
    expect(DEFAULT_EMPLOYEES).toHaveLength(11)
  })

  it('all employees have required fields', () => {
    for (const emp of DEFAULT_EMPLOYEES) {
      expect(emp.id).toBeTruthy()
      expect(emp.name).toBeTruthy()
      expect(emp.status).toMatch(/^(active|inactive)$/)
      expect(typeof emp.createdAt).toBe('number')
      expect(typeof emp.updatedAt).toBe('number')
    }
  })

  it('all IDs are unique', () => {
    const ids = DEFAULT_EMPLOYEES.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('DEFAULT_COMMODITY_TYPES', () => {
  it('has 4 types', () => {
    expect(DEFAULT_COMMODITY_TYPES).toHaveLength(4)
  })

  it('contains bento, single, drink, dumpling typeIds', () => {
    const typeIds = DEFAULT_COMMODITY_TYPES.map((ct) => ct.typeId)
    expect(typeIds).toEqual(['bento', 'single', 'drink', 'dumpling'])
  })
})

describe('DEFAULT_COMMODITIES', () => {
  it('has 46 items', () => {
    expect(DEFAULT_COMMODITIES).toHaveLength(46)
  })

  it('all items are on market by default', () => {
    for (const com of DEFAULT_COMMODITIES) {
      expect(com.onMarket).toBe(true)
    }
  })

  it('all IDs are unique', () => {
    const ids = DEFAULT_COMMODITIES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('com-001 through com-014 have includesSoup=true', () => {
    const soupIds = [
      'com-001', 'com-002', 'com-003', 'com-004', 'com-005',
      'com-006', 'com-007', 'com-008', 'com-009', 'com-010',
      'com-011', 'com-012', 'com-013', 'com-014',
    ]
    for (const id of soupIds) {
      const com = DEFAULT_COMMODITIES.find(c => c.id === id)
      expect(com, `${id} should exist`).toBeDefined()
      expect(com!.includesSoup, `${id} should have includesSoup=true`).toBe(true)
    }
  })

  it('com-015, com-016, com-017 have includesSoup=false', () => {
    const noSoupIds = ['com-015', 'com-016', 'com-017']
    for (const id of noSoupIds) {
      const com = DEFAULT_COMMODITIES.find(c => c.id === id)
      expect(com, `${id} should exist`).toBeDefined()
      expect(com!.includesSoup, `${id} should have includesSoup=false`).toBe(false)
    }
  })
})
