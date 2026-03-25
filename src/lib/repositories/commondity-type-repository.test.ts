/**
 * Tests for CommondityTypeRepository.
 * Uses a mock AsyncDatabase since SQLite WASM cannot run in Node/Vitest.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AsyncDatabase } from '@/lib/worker-database'
import { createCommondityTypeRepository } from './commondity-type-repository'

function createMockAsyncDb(): AsyncDatabase {
  return {
    exec: vi.fn(async () => ({ rows: [], changes: 0 })),
  }
}

describe('CommondityTypeRepository', () => {
  let db: AsyncDatabase

  beforeEach(() => {
    db = createMockAsyncDb()
  })

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('calls db.exec with correct SQL', async () => {
      const repo = createCommondityTypeRepository(db)
      await repo.findAll()

      expect(db.exec).toHaveBeenCalledWith(
        'SELECT * FROM commondity_types ORDER BY id ASC',
      )
    })

    it('returns empty array when no rows exist', async () => {
      const repo = createCommondityTypeRepository(db)
      const result = await repo.findAll()

      expect(result).toEqual([])
    })

    it('maps rows to CommondityType objects', async () => {
      const mockRows = [
        {
          id: 'ct-001',
          type_id: 'bento',
          type: 'bento',
          label: '便當',
          color: '#ff0000',
          created_at: 1700000000000,
          updated_at: 1700000000000,
        },
        {
          id: 'ct-002',
          type_id: 'drink',
          type: 'drink',
          label: '飲料',
          color: '',
          created_at: 1700000000000,
          updated_at: 1700000000000,
        },
      ]

      vi.mocked(db.exec).mockResolvedValueOnce({
        rows: mockRows,
        changes: 0,
      })

      const repo = createCommondityTypeRepository(db)
      const result = await repo.findAll()

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: 'ct-001',
        typeId: 'bento',
        type: 'bento',
        label: '便當',
        color: '#ff0000',
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
      })
      expect(result[1]).toEqual({
        id: 'ct-002',
        typeId: 'drink',
        type: 'drink',
        label: '飲料',
        color: '',
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
      })
    })
  })

  // ─── findById ───────────────────────────────────────────────────────────────

  describe('findById()', () => {
    it('calls db.exec with correct SQL and param', async () => {
      const repo = createCommondityTypeRepository(db)
      await repo.findById('ct-001')

      expect(db.exec).toHaveBeenCalledWith(
        'SELECT * FROM commondity_types WHERE id = ?',
        ['ct-001'],
      )
    })

    it('returns undefined when no row found', async () => {
      const repo = createCommondityTypeRepository(db)
      const result = await repo.findById('non-existent')

      expect(result).toBeUndefined()
    })

    it('returns mapped CommondityType when row found', async () => {
      vi.mocked(db.exec).mockResolvedValueOnce({
        rows: [
          {
            id: 'ct-001',
            type_id: 'bento',
            type: 'bento',
            label: '便當',
            color: '',
            created_at: 1700000000000,
            updated_at: 1700000000000,
          },
        ],
        changes: 0,
      })

      const repo = createCommondityTypeRepository(db)
      const result = await repo.findById('ct-001')

      expect(result).toEqual({
        id: 'ct-001',
        typeId: 'bento',
        type: 'bento',
        label: '便當',
        color: '',
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
      })
    })
  })

  // ─── findByTypeId ───────────────────────────────────────────────────────────

  describe('findByTypeId()', () => {
    it('calls db.exec with correct SQL and param', async () => {
      const repo = createCommondityTypeRepository(db)
      await repo.findByTypeId('bento')

      expect(db.exec).toHaveBeenCalledWith(
        'SELECT * FROM commondity_types WHERE type_id = ?',
        ['bento'],
      )
    })

    it('returns undefined when no row found', async () => {
      const repo = createCommondityTypeRepository(db)
      const result = await repo.findByTypeId('non-existent')

      expect(result).toBeUndefined()
    })

    it('returns mapped CommondityType when row found', async () => {
      vi.mocked(db.exec).mockResolvedValueOnce({
        rows: [
          {
            id: 'ct-001',
            type_id: 'bento',
            type: 'bento',
            label: '便當',
            color: '',
            created_at: 1700000000000,
            updated_at: 1700000000000,
          },
        ],
        changes: 0,
      })

      const repo = createCommondityTypeRepository(db)
      const result = await repo.findByTypeId('bento')

      expect(result).toEqual({
        id: 'ct-001',
        typeId: 'bento',
        type: 'bento',
        label: '便當',
        color: '',
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
      })
    })
  })

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('calls db.exec with INSERT SQL and correct params', async () => {
      // First call: INSERT, second call: SELECT (findById)
      vi.mocked(db.exec)
        .mockResolvedValueOnce({ rows: [], changes: 1 })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'generated-id',
              type_id: 'bento',
              type: 'bento',
              label: '便當',
              color: '#ff0000',
              created_at: 1700000000000,
              updated_at: 1700000000000,
            },
          ],
          changes: 0,
        })

      const repo = createCommondityTypeRepository(db)
      await repo.create({
        typeId: 'bento',
        type: 'bento',
        label: '便當',
        color: '#ff0000',
      })

      const insertCall = vi.mocked(db.exec).mock.calls[0]
      expect(insertCall![0]).toContain('INSERT INTO commondity_types')
      expect(insertCall![1]).toEqual(
        expect.arrayContaining(['bento', 'bento', '便當', '#ff0000']),
      )
    })

    it('returns the created CommondityType', async () => {
      vi.mocked(db.exec)
        .mockResolvedValueOnce({ rows: [], changes: 1 })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'generated-id',
              type_id: 'drink',
              type: 'drink',
              label: '飲料',
              color: '',
              created_at: 1700000000000,
              updated_at: 1700000000000,
            },
          ],
          changes: 0,
        })

      const repo = createCommondityTypeRepository(db)
      const result = await repo.create({
        typeId: 'drink',
        type: 'drink',
        label: '飲料',
        color: '',
      })

      expect(result).toEqual({
        id: 'generated-id',
        typeId: 'drink',
        type: 'drink',
        label: '飲料',
        color: '',
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
      })
    })
  })

  // ─── remove ─────────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('calls db.exec with DELETE SQL and correct param', async () => {
      const repo = createCommondityTypeRepository(db)
      await repo.remove('ct-001')

      expect(db.exec).toHaveBeenCalledWith(
        'DELETE FROM commondity_types WHERE id = ?',
        ['ct-001'],
      )
    })

    it('returns true when row was deleted', async () => {
      db.exec = vi.fn(async () => ({ rows: [], changes: 1 }))
      const repo = createCommondityTypeRepository(db)
      const result = await repo.remove('ct-001')

      expect(result).toBe(true)
    })

    it('returns false when row did not exist', async () => {
      db.exec = vi.fn(async () => ({ rows: [], changes: 0 }))
      const repo = createCommondityTypeRepository(db)
      const result = await repo.remove('non-existent')

      expect(result).toBe(false)
    })
  })
})
