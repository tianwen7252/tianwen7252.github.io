import { nanoid } from 'nanoid'
import dayjs from 'dayjs'
import type { AsyncDatabase } from '@/lib/worker-database'
import type { Order, CreateOrder } from '@/lib/schemas'

export interface OrderRepository {
  findAll(): Promise<Order[]>
  findById(id: string): Promise<Order | undefined>
  findByDateRange(startDate: number, endDate: number): Promise<Order[]>
  create(data: CreateOrder): Promise<Order>
  remove(id: string): Promise<boolean>
  getNextOrderNumber(): Promise<number>
}

/**
 * Parse a raw DB row into an Order object.
 * Handles JSON.parse for data and memo fields.
 */
function toOrder(row: Record<string, unknown>): Order {
  return {
    id: String(row['id']),
    number: Number(row['number']),
    data: JSON.parse(String(row['data'] ?? '[]')),
    memo: JSON.parse(String(row['memo'] ?? '[]')),
    soups: Number(row['soups']),
    total: Number(row['total']),
    originalTotal:
      row['original_total'] != null ? Number(row['original_total']) : undefined,
    editedMemo:
      row['edited_memo'] != null ? String(row['edited_memo']) : undefined,
    editor: String(row['editor'] ?? ''),
    createdAt: Number(row['created_at']),
    updatedAt: Number(row['updated_at']),
  }
}

export function createOrderRepository(db: AsyncDatabase): OrderRepository {
  return {
    async findAll() {
      const result = await db.exec<Record<string, unknown>>(
        'SELECT * FROM orders ORDER BY created_at DESC',
      )
      return result.rows.map(toOrder)
    },

    async findById(id: string) {
      const result = await db.exec<Record<string, unknown>>(
        'SELECT * FROM orders WHERE id = ?',
        [id],
      )
      const row = result.rows[0]
      return row ? toOrder(row) : undefined
    },

    async findByDateRange(startDate: number, endDate: number) {
      const result = await db.exec<Record<string, unknown>>(
        'SELECT * FROM orders WHERE created_at >= ? AND created_at <= ? ORDER BY created_at DESC',
        [startDate, endDate],
      )
      return result.rows.map(toOrder)
    },

    async create(data: CreateOrder) {
      const id = nanoid()
      const now = Date.now()
      await db.exec(
        `INSERT INTO orders (id, number, data, memo, soups, total, original_total, edited_memo, editor, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.number,
          JSON.stringify(data.data),
          JSON.stringify(data.memo),
          data.soups,
          data.total,
          data.originalTotal ?? null,
          data.editedMemo ?? null,
          data.editor,
          now,
          now,
        ],
      )
      const created = await this.findById(id)
      if (!created) throw new Error(`Failed to retrieve created order with id: ${id}`)
      return created
    },

    async remove(id: string) {
      const result = await db.exec(
        'DELETE FROM orders WHERE id = ?',
        [id],
      )
      return (result.changes ?? 0) > 0
    },

    async getNextOrderNumber() {
      const todayStart = dayjs().startOf('day').valueOf()
      const tomorrowStart = dayjs().add(1, 'day').startOf('day').valueOf()

      const result = await db.exec<Record<string, unknown>>(
        'SELECT MAX(number) as max_number FROM orders WHERE created_at >= ? AND created_at < ?',
        [todayStart, tomorrowStart],
      )

      const row = result.rows[0]
      const maxNumber = row ? Number(row['max_number']) : null
      return maxNumber != null && !isNaN(maxNumber) ? maxNumber + 1 : 1
    },
  }
}
