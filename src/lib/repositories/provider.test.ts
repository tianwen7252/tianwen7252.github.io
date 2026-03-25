/**
 * Tests for the repository provider module.
 * Verifies singleton lifecycle: init, get, reset.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { AsyncDatabase } from '@/lib/worker-database'

import {
  initRepositories,
  getEmployeeRepo,
  getAttendanceRepo,
  getCommondityTypeRepo,
  getCommondityRepo,
  getOrderRepo,
  getOrderItemRepo,
  getOrderDiscountRepo,
  resetRepositories,
} from './provider'

function createMockAsyncDb(): AsyncDatabase {
  return {
    exec: vi.fn(async () => ({ rows: [], changes: 0 })),
  }
}

describe('Repository Provider', () => {
  beforeEach(() => {
    // Ensure clean state before each test
    resetRepositories()
  })

  describe('getEmployeeRepo()', () => {
    it('throws before initRepositories() is called', () => {
      expect(() => getEmployeeRepo()).toThrow(
        'Repositories not initialized. Call initRepositories(db) first.',
      )
    })

    it('returns a repository after initRepositories() is called', () => {
      const db = createMockAsyncDb()
      initRepositories(db)

      const repo = getEmployeeRepo()
      expect(repo).toBeDefined()
      expect(typeof repo.findAll).toBe('function')
      expect(typeof repo.findById).toBe('function')
      expect(typeof repo.create).toBe('function')
      expect(typeof repo.update).toBe('function')
      expect(typeof repo.remove).toBe('function')
      expect(typeof repo.findByStatus).toBe('function')
      expect(typeof repo.findByEmployeeNo).toBe('function')
    })

    it('returns the same instance on repeated calls', () => {
      const db = createMockAsyncDb()
      initRepositories(db)

      const repo1 = getEmployeeRepo()
      const repo2 = getEmployeeRepo()
      expect(repo1).toBe(repo2)
    })
  })

  describe('getAttendanceRepo()', () => {
    it('throws before initRepositories() is called', () => {
      expect(() => getAttendanceRepo()).toThrow(
        'Repositories not initialized. Call initRepositories(db) first.',
      )
    })

    it('returns a repository after initRepositories() is called', () => {
      const db = createMockAsyncDb()
      initRepositories(db)

      const repo = getAttendanceRepo()
      expect(repo).toBeDefined()
      expect(typeof repo.findAll).toBe('function')
      expect(typeof repo.findById).toBe('function')
      expect(typeof repo.create).toBe('function')
      expect(typeof repo.update).toBe('function')
      expect(typeof repo.remove).toBe('function')
      expect(typeof repo.findByEmployeeId).toBe('function')
      expect(typeof repo.findByDate).toBe('function')
      expect(typeof repo.findByEmployeeAndDate).toBe('function')
      expect(typeof repo.findByMonth).toBe('function')
    })

    it('returns the same instance on repeated calls', () => {
      const db = createMockAsyncDb()
      initRepositories(db)

      const repo1 = getAttendanceRepo()
      const repo2 = getAttendanceRepo()
      expect(repo1).toBe(repo2)
    })
  })

  describe('getCommondityTypeRepo()', () => {
    it('throws before initRepositories() is called', () => {
      expect(() => getCommondityTypeRepo()).toThrow(
        'Repositories not initialized. Call initRepositories(db) first.',
      )
    })

    it('returns a repository after initRepositories() is called', () => {
      const db = createMockAsyncDb()
      initRepositories(db)

      const repo = getCommondityTypeRepo()
      expect(repo).toBeDefined()
      expect(typeof repo.findAll).toBe('function')
      expect(typeof repo.findById).toBe('function')
      expect(typeof repo.findByTypeId).toBe('function')
      expect(typeof repo.create).toBe('function')
      expect(typeof repo.remove).toBe('function')
    })

    it('returns the same instance on repeated calls', () => {
      const db = createMockAsyncDb()
      initRepositories(db)

      const repo1 = getCommondityTypeRepo()
      const repo2 = getCommondityTypeRepo()
      expect(repo1).toBe(repo2)
    })
  })

  describe('getCommondityRepo()', () => {
    it('throws before initRepositories() is called', () => {
      expect(() => getCommondityRepo()).toThrow(
        'Repositories not initialized. Call initRepositories(db) first.',
      )
    })

    it('returns a repository after initRepositories() is called', () => {
      const db = createMockAsyncDb()
      initRepositories(db)

      const repo = getCommondityRepo()
      expect(repo).toBeDefined()
      expect(typeof repo.findAll).toBe('function')
      expect(typeof repo.findById).toBe('function')
      expect(typeof repo.findByTypeId).toBe('function')
      expect(typeof repo.findOnMarket).toBe('function')
      expect(typeof repo.create).toBe('function')
      expect(typeof repo.update).toBe('function')
      expect(typeof repo.remove).toBe('function')
    })

    it('returns the same instance on repeated calls', () => {
      const db = createMockAsyncDb()
      initRepositories(db)

      const repo1 = getCommondityRepo()
      const repo2 = getCommondityRepo()
      expect(repo1).toBe(repo2)
    })
  })

  describe('getOrderRepo()', () => {
    it('throws before initRepositories() is called', () => {
      expect(() => getOrderRepo()).toThrow(
        'Repositories not initialized. Call initRepositories(db) first.',
      )
    })

    it('returns a repository after initRepositories() is called', () => {
      const db = createMockAsyncDb()
      initRepositories(db)

      const repo = getOrderRepo()
      expect(repo).toBeDefined()
      expect(typeof repo.findAll).toBe('function')
      expect(typeof repo.findById).toBe('function')
      expect(typeof repo.findByDateRange).toBe('function')
      expect(typeof repo.create).toBe('function')
      expect(typeof repo.getNextOrderNumber).toBe('function')
    })

    it('returns the same instance on repeated calls', () => {
      const db = createMockAsyncDb()
      initRepositories(db)

      const repo1 = getOrderRepo()
      const repo2 = getOrderRepo()
      expect(repo1).toBe(repo2)
    })
  })

  describe('getOrderItemRepo()', () => {
    it('throws before initRepositories() is called', () => {
      expect(() => getOrderItemRepo()).toThrow(
        'Repositories not initialized. Call initRepositories(db) first.',
      )
    })

    it('returns a repository after initRepositories() is called', () => {
      const db = createMockAsyncDb()
      initRepositories(db)

      const repo = getOrderItemRepo()
      expect(repo).toBeDefined()
      expect(typeof repo.findByOrderId).toBe('function')
      expect(typeof repo.createBatch).toBe('function')
      expect(typeof repo.removeByOrderId).toBe('function')
    })

    it('returns the same instance on repeated calls', () => {
      const db = createMockAsyncDb()
      initRepositories(db)

      const repo1 = getOrderItemRepo()
      const repo2 = getOrderItemRepo()
      expect(repo1).toBe(repo2)
    })
  })

  describe('getOrderDiscountRepo()', () => {
    it('throws before initRepositories() is called', () => {
      expect(() => getOrderDiscountRepo()).toThrow(
        'Repositories not initialized. Call initRepositories(db) first.',
      )
    })

    it('returns a repository after initRepositories() is called', () => {
      const db = createMockAsyncDb()
      initRepositories(db)

      const repo = getOrderDiscountRepo()
      expect(repo).toBeDefined()
      expect(typeof repo.findByOrderId).toBe('function')
      expect(typeof repo.createBatch).toBe('function')
      expect(typeof repo.removeByOrderId).toBe('function')
    })

    it('returns the same instance on repeated calls', () => {
      const db = createMockAsyncDb()
      initRepositories(db)

      const repo1 = getOrderDiscountRepo()
      const repo2 = getOrderDiscountRepo()
      expect(repo1).toBe(repo2)
    })
  })

  describe('resetRepositories()', () => {
    it('causes getEmployeeRepo() to throw after reset', () => {
      const db = createMockAsyncDb()
      initRepositories(db)

      // Sanity: getter works before reset
      expect(() => getEmployeeRepo()).not.toThrow()

      resetRepositories()

      expect(() => getEmployeeRepo()).toThrow(
        'Repositories not initialized. Call initRepositories(db) first.',
      )
    })

    it('causes getAttendanceRepo() to throw after reset', () => {
      const db = createMockAsyncDb()
      initRepositories(db)

      expect(() => getAttendanceRepo()).not.toThrow()

      resetRepositories()

      expect(() => getAttendanceRepo()).toThrow(
        'Repositories not initialized. Call initRepositories(db) first.',
      )
    })

    it('causes getCommondityTypeRepo() to throw after reset', () => {
      const db = createMockAsyncDb()
      initRepositories(db)

      expect(() => getCommondityTypeRepo()).not.toThrow()

      resetRepositories()

      expect(() => getCommondityTypeRepo()).toThrow(
        'Repositories not initialized. Call initRepositories(db) first.',
      )
    })

    it('causes getCommondityRepo() to throw after reset', () => {
      const db = createMockAsyncDb()
      initRepositories(db)

      expect(() => getCommondityRepo()).not.toThrow()

      resetRepositories()

      expect(() => getCommondityRepo()).toThrow(
        'Repositories not initialized. Call initRepositories(db) first.',
      )
    })

    it('causes getOrderRepo() to throw after reset', () => {
      const db = createMockAsyncDb()
      initRepositories(db)

      expect(() => getOrderRepo()).not.toThrow()

      resetRepositories()

      expect(() => getOrderRepo()).toThrow(
        'Repositories not initialized. Call initRepositories(db) first.',
      )
    })

    it('causes getOrderItemRepo() to throw after reset', () => {
      const db = createMockAsyncDb()
      initRepositories(db)

      expect(() => getOrderItemRepo()).not.toThrow()

      resetRepositories()

      expect(() => getOrderItemRepo()).toThrow(
        'Repositories not initialized. Call initRepositories(db) first.',
      )
    })

    it('causes getOrderDiscountRepo() to throw after reset', () => {
      const db = createMockAsyncDb()
      initRepositories(db)

      expect(() => getOrderDiscountRepo()).not.toThrow()

      resetRepositories()

      expect(() => getOrderDiscountRepo()).toThrow(
        'Repositories not initialized. Call initRepositories(db) first.',
      )
    })

    it('allows re-initialization after reset', () => {
      const db1 = createMockAsyncDb()
      const db2 = createMockAsyncDb()

      initRepositories(db1)
      // Verify repo works before reset
      expect(() => getEmployeeRepo()).not.toThrow()

      resetRepositories()
      initRepositories(db2)

      const repoAfterReset = getEmployeeRepo()
      // Should be a new instance since we used a different db
      expect(repoAfterReset).toBeDefined()
      expect(typeof repoAfterReset.findAll).toBe('function')
    })
  })

  describe('initRepositories()', () => {
    it('can be called with a valid AsyncDatabase object', () => {
      const db = createMockAsyncDb()
      expect(() => initRepositories(db)).not.toThrow()
    })
  })
})
