/**
 * Tests for the repository provider module.
 * Verifies singleton lifecycle: init, get, reset.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { AsyncDatabase } from '@/lib/worker-database'

// Will import from the provider module once it exists
import {
  initRepositories,
  getEmployeeRepo,
  getAttendanceRepo,
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
