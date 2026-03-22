import { nanoid } from 'nanoid'
import type { AsyncDatabase } from '@/lib/worker-database'
import type { CommondityType, CreateCommondityType } from '@/lib/schemas'

export interface CommondityTypeRepository {
  findAll(): Promise<CommondityType[]>
  findById(id: string): Promise<CommondityType | undefined>
  findByTypeId(typeId: string): Promise<CommondityType | undefined>
  create(data: CreateCommondityType): Promise<CommondityType>
  remove(id: string): Promise<boolean>
}

/**
 * Parse a raw DB row into a CommondityType object.
 */
function toCommondityType(row: Record<string, unknown>): CommondityType {
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

export function createCommondityTypeRepository(
  db: AsyncDatabase,
): CommondityTypeRepository {
  return {
    async findAll() {
      const result = await db.exec<Record<string, unknown>>(
        'SELECT * FROM commondity_types ORDER BY type_id ASC',
      )
      return result.rows.map(toCommondityType)
    },

    async findById(id: string) {
      const result = await db.exec<Record<string, unknown>>(
        'SELECT * FROM commondity_types WHERE id = ?',
        [id],
      )
      const row = result.rows[0]
      return row ? toCommondityType(row) : undefined
    },

    async findByTypeId(typeId: string) {
      const result = await db.exec<Record<string, unknown>>(
        'SELECT * FROM commondity_types WHERE type_id = ?',
        [typeId],
      )
      const row = result.rows[0]
      return row ? toCommondityType(row) : undefined
    },

    async create(data: CreateCommondityType) {
      const id = nanoid()
      const now = Date.now()
      await db.exec(
        `INSERT INTO commondity_types (id, type_id, type, label, color, created_at, updated_at)
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
      if (!created) throw new Error(`Failed to retrieve created commondity type with id: ${id}`)
      return created
    },

    async remove(id: string) {
      const result = await db.exec('DELETE FROM commondity_types WHERE id = ?', [id])
      return result.changes > 0
    },
  }
}
