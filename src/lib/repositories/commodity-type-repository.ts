import { nanoid } from 'nanoid'
import type { AsyncDatabase } from '@/lib/worker-database'
import type { CommodityType, CreateCommodityType } from '@/lib/schemas'

export interface CommodityTypeRepository {
  findAll(): Promise<CommodityType[]>
  findById(id: string): Promise<CommodityType | undefined>
  findByTypeId(typeId: string): Promise<CommodityType | undefined>
  create(data: CreateCommodityType): Promise<CommodityType>
  remove(id: string): Promise<boolean>
}

/**
 * Parse a raw DB row into a CommodityType object.
 */
function toCommodityType(row: Record<string, unknown>): CommodityType {
  return {
    id: String(row['id']),
    typeId: String(row['type_id']),
    type: String(row['type']),
    label: String(row['label']),
    color: String(row['color'] ?? ''),
    createdAt: Number(row['created_at']),
    updatedAt: Number(row['updated_at']),
  }
}

export function createCommodityTypeRepository(
  db: AsyncDatabase,
): CommodityTypeRepository {
  return {
    async findAll() {
      const result = await db.exec<Record<string, unknown>>(
        'SELECT * FROM commodity_types ORDER BY id ASC',
      )
      return result.rows.map(toCommodityType)
    },

    async findById(id: string) {
      const result = await db.exec<Record<string, unknown>>(
        'SELECT * FROM commodity_types WHERE id = ?',
        [id],
      )
      const row = result.rows[0]
      return row ? toCommodityType(row) : undefined
    },

    async findByTypeId(typeId: string) {
      const result = await db.exec<Record<string, unknown>>(
        'SELECT * FROM commodity_types WHERE type_id = ?',
        [typeId],
      )
      const row = result.rows[0]
      return row ? toCommodityType(row) : undefined
    },

    async create(data: CreateCommodityType) {
      const id = nanoid()
      const now = Date.now()
      await db.exec(
        `INSERT INTO commodity_types (id, type_id, type, label, color, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.typeId,
          data.type,
          data.label,
          data.color,
          now,
          now,
        ],
      )
      const created = await this.findById(id)
      if (!created) throw new Error(`Failed to retrieve created commodity type with id: ${id}`)
      return created
    },

    async remove(id: string) {
      const result = await db.exec('DELETE FROM commodity_types WHERE id = ?', [id])
      return result.changes > 0
    },
  }
}
