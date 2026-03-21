import { describe, it, expect, beforeEach } from 'vitest'
import { mockEmployeeService } from './employees'

beforeEach(() => {
  mockEmployeeService.reset()
})

describe('mockEmployeeService', () => {
  describe('getAll', () => {
    it('returns all sample employees', () => {
      const all = mockEmployeeService.getAll()
      expect(all.length).toBe(6)
    })

    it('returns a copy, not a reference', () => {
      const a = mockEmployeeService.getAll()
      const b = mockEmployeeService.getAll()
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })
  })

  describe('getActive', () => {
    it('returns only active employees', () => {
      const active = mockEmployeeService.getActive()
      expect(active.every(e => e.status === 'active')).toBe(true)
      expect(active.length).toBe(5)
    })
  })

  describe('getById', () => {
    it('returns employee by id', () => {
      const emp = mockEmployeeService.getById('emp-001')
      expect(emp).toBeDefined()
      expect(emp!.name).toBe('王小明')
    })

    it('returns undefined for unknown id', () => {
      expect(mockEmployeeService.getById('unknown')).toBeUndefined()
    })
  })

  describe('add', () => {
    it('adds a new employee and returns it with generated id', () => {
      const result = mockEmployeeService.add({
        name: '新員工',
        status: 'active',
        shiftType: 'regular',
        isAdmin: false,
      })
      expect(result.id).toBeDefined()
      expect(result.name).toBe('新員工')
      expect(result.createdAt).toBeGreaterThan(0)
      expect(mockEmployeeService.getAll().length).toBe(7)
    })
  })

  describe('update', () => {
    it('updates employee fields and returns updated employee', () => {
      const result = mockEmployeeService.update('emp-001', { name: '王大明' })
      expect(result).toBeDefined()
      expect(result!.name).toBe('王大明')
      expect(result!.updatedAt).toBeGreaterThan(0)
    })

    it('does not mutate original state', () => {
      const before = mockEmployeeService.getById('emp-001')
      mockEmployeeService.update('emp-001', { name: '王大明' })
      const after = mockEmployeeService.getById('emp-001')
      expect(after!.name).toBe('王大明')
      expect(before!.name).toBe('王小明')
    })

    it('returns undefined for unknown id', () => {
      expect(
        mockEmployeeService.update('unknown', { name: 'x' }),
      ).toBeUndefined()
    })
  })

  describe('remove', () => {
    it('removes employee and returns true', () => {
      expect(mockEmployeeService.remove('emp-001')).toBe(true)
      expect(mockEmployeeService.getAll().length).toBe(5)
    })

    it('returns false for unknown id', () => {
      expect(mockEmployeeService.remove('unknown')).toBe(false)
    })
  })

  describe('reset', () => {
    it('restores initial data after mutations', () => {
      mockEmployeeService.remove('emp-001')
      mockEmployeeService.remove('emp-002')
      expect(mockEmployeeService.getAll().length).toBe(4)

      mockEmployeeService.reset()
      expect(mockEmployeeService.getAll().length).toBe(6)
    })
  })
})
