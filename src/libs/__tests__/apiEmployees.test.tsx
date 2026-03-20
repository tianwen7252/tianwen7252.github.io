import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Use vi.hoisted to create testDb before vi.mock hoisting
// Must use require() inside vi.hoisted since imports are also hoisted
const { testDb } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Dexie = require('dexie').default
  const testDb = new Dexie('TestEmployeesDB')

  testDb.version(1).stores({
    employees: '++id, name, avatar, status, shiftType, employeeNo',
  })

  return { testDb }
})

// Mock dataCenter to use our test DB (avoids circular dependency init() crash)
vi.mock('src/libs/dataCenter', () => ({
  db: testDb,
  DB_NAME: 'TestEmployeesDB',
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

import { employees } from '../api'

describe('employees API', () => {
  beforeEach(async () => {
    await testDb.employees.clear()
  })

  afterEach(async () => {
    await testDb.employees.clear()
  })

  describe('add()', () => {
    it('should auto-generate employeeNo "001" for the first employee', async () => {
      const id = await employees.add({
        name: 'Alice',
        avatar: '',
        status: 'active',
      })

      const record = await testDb.employees.get(id)
      expect(record).toBeDefined()
      expect(record!.name).toBe('Alice')
      expect(record!.employeeNo).toBe('001')
    })

    it('should auto-generate sequential employeeNo for subsequent employees', async () => {
      await employees.add({
        name: 'Alice',
        avatar: '',
        status: 'active',
      })
      const id2 = await employees.add({
        name: 'Bob',
        avatar: '',
        status: 'active',
      })

      const record = await testDb.employees.get(id2)
      expect(record!.employeeNo).toBe('002')
    })

    it('should continue numbering from the max employeeNo', async () => {
      // Manually insert an employee with a high number
      await testDb.employees.add({
        name: 'Existing',
        avatar: '',
        status: 'active',
        employeeNo: '010',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      const id = await employees.add({
        name: 'NewEmployee',
        avatar: '',
        status: 'active',
      })

      const record = await testDb.employees.get(id)
      expect(record!.employeeNo).toBe('011')
    })

    it('should include createdAt and updatedAt timestamps', async () => {
      const beforeTime = Date.now()
      const id = await employees.add({
        name: 'Test',
        avatar: '',
        status: 'active',
      })
      const afterTime = Date.now()

      const record = await testDb.employees.get(id)
      expect(record!.createdAt).toBeGreaterThanOrEqual(beforeTime)
      expect(record!.createdAt).toBeLessThanOrEqual(afterTime)
      expect(record!.updatedAt).toBeGreaterThanOrEqual(beforeTime)
      expect(record!.updatedAt).toBeLessThanOrEqual(afterTime)
    })

    it('should preserve shiftType when provided', async () => {
      const id = await employees.add({
        name: 'ShiftWorker',
        avatar: '',
        status: 'active',
        shiftType: 'shift',
      })

      const record = await testDb.employees.get(id)
      expect(record!.shiftType).toBe('shift')
    })

    it('should not mutate the input record', async () => {
      const input = {
        name: 'Immutable',
        avatar: '',
        status: 'active',
      }
      const inputCopy = { ...input }

      await employees.add(input)

      // Original input should not have been mutated
      expect(input).toEqual(inputCopy)
    })
  })

  describe('get()', () => {
    it('should return all employees', async () => {
      await employees.add({ name: 'Alice', avatar: '', status: 'active' })
      await employees.add({ name: 'Bob', avatar: '', status: 'active' })

      const result = await employees.get()
      expect(result).toHaveLength(2)
      expect(result.map(e => e.name)).toContain('Alice')
      expect(result.map(e => e.name)).toContain('Bob')
    })

    it('should return empty array when no employees exist', async () => {
      const result = await employees.get()
      expect(result).toEqual([])
    })
  })

  describe('set()', () => {
    it('should update employee fields', async () => {
      const id = await employees.add({
        name: 'Original',
        avatar: '',
        status: 'active',
      })

      await employees.set(id as number, { name: 'Updated' })

      const record = await testDb.employees.get(id)
      expect(record!.name).toBe('Updated')
    })

    it('should update the updatedAt timestamp', async () => {
      const id = await employees.add({
        name: 'Test',
        avatar: '',
        status: 'active',
      })

      const beforeUpdate = Date.now()
      await employees.set(id as number, { name: 'Updated' })
      const afterUpdate = Date.now()

      const record = await testDb.employees.get(id)
      expect(record!.updatedAt).toBeGreaterThanOrEqual(beforeUpdate)
      expect(record!.updatedAt).toBeLessThanOrEqual(afterUpdate)
    })
  })

  describe('delete()', () => {
    it('should remove an employee by ID', async () => {
      const id = await employees.add({
        name: 'ToDelete',
        avatar: '',
        status: 'active',
      })

      await employees.delete(id as number)

      const record = await testDb.employees.get(id)
      expect(record).toBeUndefined()
    })
  })
})
