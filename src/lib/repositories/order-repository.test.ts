/**
 * Tests for OrderRepository.
 * Uses a mock AsyncDatabase since SQLite WASM cannot run in Node/Vitest.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AsyncDatabase } from '@/lib/worker-database'
import { createOrderRepository } from './order-repository'

function createMockAsyncDb(): AsyncDatabase {
  return {
    exec: vi.fn(async () => ({ rows: [], changes: 0 })),
  }
}

describe('OrderRepository', () => {
  let db: AsyncDatabase

  beforeEach(() => {
    db = createMockAsyncDb()
  })

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('calls db.exec with correct SQL', async () => {
      const repo = createOrderRepository(db)
      await repo.findAll()

      expect(db.exec).toHaveBeenCalledWith(
        'SELECT * FROM orders ORDER BY created_at DESC',
      )
    })

    it('returns empty array when no rows exist', async () => {
      const repo = createOrderRepository(db)
      const result = await repo.findAll()

      expect(result).toEqual([])
    })

    it('maps rows to Order objects with JSON parsing for data and memo', async () => {
      const mockRows = [
        {
          id: 'ord-001',
          number: 1,
          data: JSON.stringify([
            { comID: 'com-001', value: '滷肉便當', res: '100', type: 'bento' },
          ]),
          memo: JSON.stringify(['加辣', '不要酸菜']),
          soups: 2,
          total: 200,
          original_total: 200,
          edited_memo: null,
          editor: '',
          created_at: 1700000000000,
          updated_at: 1700000000000,
        },
      ]

      vi.mocked(db.exec).mockResolvedValueOnce({
        rows: mockRows,
        changes: 0,
      })

      const repo = createOrderRepository(db)
      const result = await repo.findAll()

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'ord-001',
        number: 1,
        data: [{ comID: 'com-001', value: '滷肉便當', res: '100', type: 'bento' }],
        memo: ['加辣', '不要酸菜'],
        soups: 2,
        total: 200,
        originalTotal: 200,
        editedMemo: undefined,
        editor: '',
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
      })
    })

    it('handles empty JSON arrays for data and memo', async () => {
      vi.mocked(db.exec).mockResolvedValueOnce({
        rows: [
          {
            id: 'ord-002',
            number: 2,
            data: '[]',
            memo: '[]',
            soups: 0,
            total: 0,
            original_total: null,
            edited_memo: null,
            editor: '',
            created_at: 1700000000000,
            updated_at: 1700000000000,
          },
        ],
        changes: 0,
      })

      const repo = createOrderRepository(db)
      const result = await repo.findAll()

      expect(result[0]!.data).toEqual([])
      expect(result[0]!.memo).toEqual([])
      expect(result[0]!.originalTotal).toBeUndefined()
    })
  })

  // ─── findById ───────────────────────────────────────────────────────────────

  describe('findById()', () => {
    it('calls db.exec with correct SQL and param', async () => {
      const repo = createOrderRepository(db)
      await repo.findById('ord-001')

      expect(db.exec).toHaveBeenCalledWith(
        'SELECT * FROM orders WHERE id = ?',
        ['ord-001'],
      )
    })

    it('returns undefined when no row found', async () => {
      const repo = createOrderRepository(db)
      const result = await repo.findById('non-existent')

      expect(result).toBeUndefined()
    })

    it('returns mapped Order when row found', async () => {
      vi.mocked(db.exec).mockResolvedValueOnce({
        rows: [
          {
            id: 'ord-001',
            number: 1,
            data: JSON.stringify([]),
            memo: JSON.stringify([]),
            soups: 0,
            total: 100,
            original_total: 100,
            edited_memo: 'modified',
            editor: 'admin',
            created_at: 1700000000000,
            updated_at: 1700000000000,
          },
        ],
        changes: 0,
      })

      const repo = createOrderRepository(db)
      const result = await repo.findById('ord-001')

      expect(result).toBeDefined()
      expect(result!.id).toBe('ord-001')
      expect(result!.editedMemo).toBe('modified')
      expect(result!.editor).toBe('admin')
    })
  })

  // ─── findByDateRange ──────────────────────────────────────────────────────

  describe('findByDateRange()', () => {
    it('calls db.exec with correct SQL and params', async () => {
      const start = 1700000000000
      const end = 1700100000000

      const repo = createOrderRepository(db)
      await repo.findByDateRange(start, end)

      expect(db.exec).toHaveBeenCalledWith(
        'SELECT * FROM orders WHERE created_at >= ? AND created_at <= ? ORDER BY created_at DESC',
        [start, end],
      )
    })

    it('returns empty array when no rows match', async () => {
      const repo = createOrderRepository(db)
      const result = await repo.findByDateRange(1700000000000, 1700100000000)

      expect(result).toEqual([])
    })

    it('maps rows correctly within date range', async () => {
      vi.mocked(db.exec).mockResolvedValueOnce({
        rows: [
          {
            id: 'ord-001',
            number: 1,
            data: '[]',
            memo: '[]',
            soups: 0,
            total: 100,
            original_total: null,
            edited_memo: null,
            editor: '',
            created_at: 1700050000000,
            updated_at: 1700050000000,
          },
        ],
        changes: 0,
      })

      const repo = createOrderRepository(db)
      const result = await repo.findByDateRange(1700000000000, 1700100000000)

      expect(result).toHaveLength(1)
      expect(result[0]!.id).toBe('ord-001')
    })
  })

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('calls db.exec with INSERT SQL, stringifying data and memo', async () => {
      vi.mocked(db.exec)
        .mockResolvedValueOnce({ rows: [], changes: 1 })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'generated-id',
              number: 1,
              data: JSON.stringify([{ comID: 'com-001', value: '滷肉便當' }]),
              memo: JSON.stringify(['加辣']),
              soups: 1,
              total: 100,
              original_total: null,
              edited_memo: null,
              editor: '',
              created_at: 1700000000000,
              updated_at: 1700000000000,
            },
          ],
          changes: 0,
        })

      const repo = createOrderRepository(db)
      await repo.create({
        number: 1,
        data: [{ comID: 'com-001', value: '滷肉便當' }],
        memo: ['加辣'],
        soups: 1,
        total: 100,
        editor: '',
      })

      const insertCall = vi.mocked(db.exec).mock.calls[0]
      expect(insertCall![0]).toContain('INSERT INTO orders')
      // Verify data and memo are stringified
      const params = insertCall![1] as unknown[]
      expect(params).toContain(JSON.stringify([{ comID: 'com-001', value: '滷肉便當' }]))
      expect(params).toContain(JSON.stringify(['加辣']))
    })

    it('returns the created Order with parsed data and memo', async () => {
      vi.mocked(db.exec)
        .mockResolvedValueOnce({ rows: [], changes: 1 })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'generated-id',
              number: 5,
              data: JSON.stringify([{ comID: 'com-001' }]),
              memo: JSON.stringify(['備註']),
              soups: 2,
              total: 250,
              original_total: 300,
              edited_memo: null,
              editor: 'admin',
              created_at: 1700000000000,
              updated_at: 1700000000000,
            },
          ],
          changes: 0,
        })

      const repo = createOrderRepository(db)
      const result = await repo.create({
        number: 5,
        data: [{ comID: 'com-001' }],
        memo: ['備註'],
        soups: 2,
        total: 250,
        originalTotal: 300,
        editor: 'admin',
      })

      expect(result.id).toBe('generated-id')
      expect(result.number).toBe(5)
      expect(result.data).toEqual([{ comID: 'com-001' }])
      expect(result.memo).toEqual(['備註'])
      expect(result.soups).toBe(2)
      expect(result.total).toBe(250)
      expect(result.originalTotal).toBe(300)
    })
  })

  // ─── getNextOrderNumber ───────────────────────────────────────────────────

  describe('getNextOrderNumber()', () => {
    it('calls db.exec with SQL to get MAX(number) for today', async () => {
      const repo = createOrderRepository(db)
      await repo.getNextOrderNumber()

      const call = vi.mocked(db.exec).mock.calls[0]
      expect(call![0]).toContain('SELECT MAX(number)')
      expect(call![0]).toContain('orders')
      expect(call![0]).toContain('created_at >= ?')
      expect(call![0]).toContain('created_at < ?')
    })

    it('returns 1 when no orders exist for today', async () => {
      vi.mocked(db.exec).mockResolvedValueOnce({
        rows: [{ max_number: null }],
        changes: 0,
      })

      const repo = createOrderRepository(db)
      const result = await repo.getNextOrderNumber()

      expect(result).toBe(1)
    })

    it('returns MAX(number) + 1 when orders exist for today', async () => {
      vi.mocked(db.exec).mockResolvedValueOnce({
        rows: [{ max_number: 5 }],
        changes: 0,
      })

      const repo = createOrderRepository(db)
      const result = await repo.getNextOrderNumber()

      expect(result).toBe(6)
    })

    it('handles the case when result rows are empty', async () => {
      vi.mocked(db.exec).mockResolvedValueOnce({
        rows: [],
        changes: 0,
      })

      const repo = createOrderRepository(db)
      const result = await repo.getNextOrderNumber()

      expect(result).toBe(1)
    })
  })

  // ─── remove ─────────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('calls db.exec with correct DELETE SQL and param', async () => {
      const repo = createOrderRepository(db)
      await repo.remove('ord-001')

      expect(db.exec).toHaveBeenCalledWith(
        'DELETE FROM orders WHERE id = ?',
        ['ord-001'],
      )
    })

    it('returns true when a row was deleted (changes > 0)', async () => {
      vi.mocked(db.exec).mockResolvedValueOnce({
        rows: [],
        changes: 1,
      })

      const repo = createOrderRepository(db)
      const result = await repo.remove('ord-001')

      expect(result).toBe(true)
    })

    it('returns false when no row was deleted (changes === 0)', async () => {
      vi.mocked(db.exec).mockResolvedValueOnce({
        rows: [],
        changes: 0,
      })

      const repo = createOrderRepository(db)
      const result = await repo.remove('non-existent')

      expect(result).toBe(false)
    })

    it('returns false when changes is undefined', async () => {
      vi.mocked(db.exec).mockResolvedValueOnce({
        rows: [],
        changes: undefined as unknown as number,
      })

      const repo = createOrderRepository(db)
      const result = await repo.remove('ord-001')

      expect(result).toBe(false)
    })
  })
})
