/**
 * Generic repository interfaces.
 * All data access goes through repositories — never call db.exec() directly.
 */

/** Synchronous repository interface (used internally in worker) */
export interface Repository<T, TCreate> {
  findAll(): T[]
  findById(id: string): T | undefined
  create(data: TCreate): T
  update(id: string, data: Partial<TCreate>): T | undefined
  remove(id: string): boolean
}

/** Async repository interface (used on main thread via Web Worker) */
export interface AsyncRepository<T, TCreate> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | undefined>
  create(data: TCreate): Promise<T>
  update(id: string, data: Partial<TCreate>): Promise<T | undefined>
  remove(id: string): Promise<boolean>
}
