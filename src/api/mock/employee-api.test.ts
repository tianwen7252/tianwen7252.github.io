/**
 * Tests for the mock EmployeeApi adapter.
 * Verifies all EmployeeApi interface methods delegate correctly
 * to the underlying mockEmployeeService.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createMockEmployeeApi, type MockEmployeeApi } from './employee-api'

describe('createMockEmployeeApi', () => {
  let api: MockEmployeeApi

  beforeEach(() => {
    api = createMockEmployeeApi()
    api.reset()
  })

  describe('getAll', () => {
    it('returns all employees as a readonly array', () => {
      const result = api.getAll()
      expect(result.length).toBe(6)
    })

    it('returns a new array reference on each call', () => {
      const a = api.getAll()
      const b = api.getAll()
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })
  })

  describe('getActive', () => {
    it('returns only employees with active status', () => {
      const active = api.getActive()
      expect(active.every(e => e.status === 'active')).toBe(true)
      expect(active.length).toBe(5)
    })
  })

  describe('getById', () => {
    it('returns employee when id exists', () => {
      const emp = api.getById('emp-001')
      expect(emp).toBeDefined()
      expect(emp!.name).toBe('\u738B\u5C0F\u660E')
    })

    it('returns undefined for non-existent id', () => {
      expect(api.getById('non-existent')).toBeUndefined()
    })

    it('returns undefined for empty string id', () => {
      expect(api.getById('')).toBeUndefined()
    })
  })

  describe('add', () => {
    it('creates and returns a new employee with generated id', () => {
      const result = api.add({
        name: '\u65B0\u54E1\u5DE5',
        status: 'active',
        shiftType: 'regular',
        isAdmin: false,
      })
      expect(result.id).toBeDefined()
      expect(result.id.length).toBeGreaterThan(0)
      expect(result.name).toBe('\u65B0\u54E1\u5DE5')
      expect(result.createdAt).toBeGreaterThan(0)
      expect(result.updatedAt).toBeGreaterThan(0)
    })

    it('increases total employee count', () => {
      const beforeCount = api.getAll().length
      api.add({
        name: '\u65B0\u54E1\u5DE5',
        status: 'active',
        shiftType: 'regular',
        isAdmin: false,
      })
      expect(api.getAll().length).toBe(beforeCount + 1)
    })
  })

  describe('update', () => {
    it('modifies employee fields and returns updated employee', () => {
      const result = api.update('emp-001', { name: '\u738B\u5927\u660E' })
      expect(result).toBeDefined()
      expect(result!.name).toBe('\u738B\u5927\u660E')
      expect(result!.updatedAt).toBeGreaterThan(0)
    })

    it('returns undefined for non-existent id', () => {
      expect(api.update('non-existent', { name: 'x' })).toBeUndefined()
    })

    it('does not mutate previously retrieved data', () => {
      const before = api.getById('emp-001')
      api.update('emp-001', { name: '\u738B\u5927\u660E' })
      // The original reference should retain the old name
      expect(before!.name).toBe('\u738B\u5C0F\u660E')
      // A new fetch should return the updated name
      expect(api.getById('emp-001')!.name).toBe('\u738B\u5927\u660E')
    })
  })

  describe('remove', () => {
    it('returns true when employee exists', () => {
      expect(api.remove('emp-001')).toBe(true)
    })

    it('decreases total employee count', () => {
      const beforeCount = api.getAll().length
      api.remove('emp-001')
      expect(api.getAll().length).toBe(beforeCount - 1)
    })

    it('returns false for non-existent id', () => {
      expect(api.remove('non-existent')).toBe(false)
    })

    it('returns false for empty string id', () => {
      expect(api.remove('')).toBe(false)
    })
  })

  describe('reset', () => {
    it('restores initial data after mutations', () => {
      api.remove('emp-001')
      api.remove('emp-002')
      expect(api.getAll().length).toBe(4)

      api.reset()
      expect(api.getAll().length).toBe(6)
    })

    it('restores data after add', () => {
      api.add({
        name: '\u65B0\u54E1\u5DE5',
        status: 'active',
        shiftType: 'regular',
        isAdmin: false,
      })
      expect(api.getAll().length).toBe(7)

      api.reset()
      expect(api.getAll().length).toBe(6)
    })
  })

  describe('immutability', () => {
    it('modifying returned array does not affect internal state', () => {
      const employees = api.getAll() as unknown[]
      employees.push({ id: 'hacked', name: 'hacker' })
      expect(api.getAll().length).toBe(6)
    })
  })
})
