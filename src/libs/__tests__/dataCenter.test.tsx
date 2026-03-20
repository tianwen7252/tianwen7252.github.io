import { describe, it, expect, vi } from 'vitest'

// Mock the side-effect-causing modules before importing dataCenter
vi.mock('src/scripts/generator', () => ({ generate: vi.fn() }))
vi.mock('src/constants/defaults/commondities', () => ({
  COMMODITY_TYPES: [],
  COMMODITIES: [],
}))
vi.mock('src/constants/defaults/orderTypes', () => ({
  ORDER_TYPES: [],
}))
vi.mock('src/constants/sync', () => ({
  NUMBER: 0,
  METHOD: 'dev',
  SOURDCE: 'default',
  SPECIFIC_TABLE: null,
}))

// Mock the full API surface used by initDB to prevent side effects
vi.mock('src/libs/api', () => ({
  commondityTypes: {
    get: vi.fn().mockResolvedValue([]),
    add: vi.fn(),
    clear: vi.fn(),
  },
  commondity: {
    get: vi.fn().mockResolvedValue([]),
    add: vi.fn(),
    clear: vi.fn(),
  },
  orderTypes: {
    get: vi.fn().mockResolvedValue([]),
    add: vi.fn(),
    clear: vi.fn(),
  },
  resetCommonditType: vi.fn(),
  resetCommondity: vi.fn(),
  resetOrderType: vi.fn(),
}))

// Mock common.ts to prevent getDeviceStorageInfo side effects
vi.mock('src/libs/common', () => ({
  getDeviceStorageInfo: vi.fn().mockResolvedValue({
    useage: '0 MB',
    percentageUsed: 0,
    remaining: '0 MB',
  }),
}))

describe('dataCenter DB schema', () => {
  it('should export DB_NAME as TianwenDB', async () => {
    const { DB_NAME } = await import('../dataCenter')
    expect(DB_NAME).toBe('TianwenDB')
  })

  it('should define employees table with hireDate and resignationDate in the schema', async () => {
    const { db } = await import('../dataCenter')

    // Verify the employees table exists in the database
    const employeesTable = db.table('employees')
    expect(employeesTable).toBeDefined()
    expect(employeesTable.name).toBe('employees')

    // Verify the schema includes the new fields as indexed columns
    const indexNames = employeesTable.schema.indexes
      .map(idx => idx.name)
      .sort()

    expect(indexNames).toContain('hireDate')
    expect(indexNames).toContain('resignationDate')
  })

  it('should have DB version set to 12', async () => {
    const { db } = await import('../dataCenter')

    // Dexie exposes the current version number via db.verno
    expect(db.verno).toBe(12)
  })

  it('should include all required tables', async () => {
    const { db } = await import('../dataCenter')

    const tableNames = db.tables.map(t => t.name).sort()
    expect(tableNames).toContain('orders')
    expect(tableNames).toContain('dailyData')
    expect(tableNames).toContain('commondityType')
    expect(tableNames).toContain('commondity')
    expect(tableNames).toContain('orderTypes')
    expect(tableNames).toContain('employees')
    expect(tableNames).toContain('attendances')
  })
})
