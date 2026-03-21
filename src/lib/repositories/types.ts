/**
 * Generic repository interface.
 * All data access goes through repositories — never call db.exec() directly.
 */
export interface Repository<T, TCreate> {
  findAll(): T[]
  findById(id: string): T | undefined
  create(data: TCreate): T
  update(id: string, data: Partial<TCreate>): T | undefined
  remove(id: string): boolean
}
