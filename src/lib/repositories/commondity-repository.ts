import { nanoid } from 'nanoid'
import type { AsyncDatabase } from '@/lib/worker-database'
import type { Commondity, CreateCommondity } from '@/lib/schemas'

export interface CommondityRepository {
  findAll(): Promise<Commondity[]>
  findByTypeId(typeId: string): Promise<Commondity[]>
  findById(id: string): Promise<Commondity | undefined>
  findOnMarket(): Promise<Commondity[]>
  create(data: CreateCommondity): Promise<Commondity>
  update(id: string, data: Partial<CreateCommondity>): Promise<Commondity | undefined>
  remove(id: string): Promise<boolean>
}

/**
 * Parse a raw DB row into a Commondity object.
 */
function toCommondity(row: Record<string, unknown>): Commondity {
  return {
    id: String(row['id']),
    typeId: String(row['type_id']),
    name: String(row['name']),
    image: row['image'] != null ? String(row['image']) : undefined,
    price: Number(row['price']),
    priority: Number(row['priority']),
    onMarket: row['on_market'] === 1 || row['on_market'] === true,
    hideOnMode:
      row['hide_on_mode'] != null ? String(row['hide_on_mode']) : undefined,
    editor: row['editor'] != null ? String(row['editor']) : undefined,
    createdAt: Number(row['created_at']),
    updatedAt: Number(row['updated_at']),
  }
}

export function createCommondityRepository(
  db: AsyncDatabase,
): CommondityRepository {
  return {
    async findAll() {
      const result = await db.exec<Record<string, unknown>>(
        'SELECT * FROM commondities ORDER BY priority ASC, name ASC',
      )
      return result.rows.map(toCommondity)
    },

    async findByTypeId(typeId: string) {
      const result = await db.exec<Record<string, unknown>>(
        'SELECT * FROM commondities WHERE type_id = ? ORDER BY priority ASC, name ASC',
        [typeId],
      )
      return result.rows.map(toCommondity)
    },

    async findById(id: string) {
      const result = await db.exec<Record<string, unknown>>(
        'SELECT * FROM commondities WHERE id = ?',
        [id],
      )
      const row = result.rows[0]
      return row ? toCommondity(row) : undefined
    },

    async findOnMarket() {
      const result = await db.exec<Record<string, unknown>>(
        'SELECT * FROM commondities WHERE on_market = 1 ORDER BY priority ASC, name ASC',
      )
      return result.rows.map(toCommondity)
    },

    async create(data: CreateCommondity) {
      const id = nanoid()
      const now = Date.now()
      await db.exec(
        `INSERT INTO commondities (id, type_id, name, image, price, priority, on_market, hide_on_mode, editor, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.typeId,
          data.name,
          data.image ?? null,
          data.price,
          data.priority,
          data.onMarket ? 1 : 0,
          data.hideOnMode ?? null,
          data.editor ?? null,
          now,
          now,
        ],
      )
      const created = await this.findById(id)
      if (!created) throw new Error(`Failed to retrieve created commondity with id: ${id}`)
      return created
    },

    async update(id: string, data: Partial<CreateCommondity>) {
      const existing = await this.findById(id)
      if (!existing) return undefined

      const fields: string[] = []
      const values: unknown[] = []

      if (data.typeId !== undefined) {
        fields.push('type_id = ?')
        values.push(data.typeId)
      }
      if (data.name !== undefined) {
        fields.push('name = ?')
        values.push(data.name)
      }
      if (data.image !== undefined) {
        fields.push('image = ?')
        values.push(data.image)
      }
      if (data.price !== undefined) {
        fields.push('price = ?')
        values.push(data.price)
      }
      if (data.priority !== undefined) {
        fields.push('priority = ?')
        values.push(data.priority)
      }
      if (data.onMarket !== undefined) {
        fields.push('on_market = ?')
        values.push(data.onMarket ? 1 : 0)
      }
      if (data.hideOnMode !== undefined) {
        fields.push('hide_on_mode = ?')
        values.push(data.hideOnMode)
      }
      if (data.editor !== undefined) {
        fields.push('editor = ?')
        values.push(data.editor)
      }

      if (fields.length === 0) return existing

      fields.push('updated_at = ?')
      values.push(Date.now())
      values.push(id)

      await db.exec(
        `UPDATE commondities SET ${fields.join(', ')} WHERE id = ?`,
        values,
      )
      const updated = await this.findById(id)
      return updated!
    },

    async remove(id: string) {
      const result = await db.exec('DELETE FROM commondities WHERE id = ?', [id])
      return result.changes > 0
    },
  }
}
