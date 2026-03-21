/**
 * SQLite WASM implementation using @sqlite.org/sqlite-wasm.
 * Uses OpfsSAHPool VFS for Safari/iPad compatibility (no sub-workers needed).
 */

import type {
  Database,
  DatabaseConfig,
  DatabaseFactory,
  QueryResult,
} from './database'

// Use the library's own types via dynamic import
type Sqlite3Static = Awaited<ReturnType<typeof import('@sqlite.org/sqlite-wasm')['default']>>
type Sqlite3DB = ReturnType<Sqlite3Static['oo1']['DB']['prototype']['exec']> extends infer _
  ? InstanceType<Sqlite3Static['oo1']['DB']>
  : never

class SqliteWasmDatabase implements Database {
  private db: Sqlite3DB | null = null

  get isReady(): boolean {
    return this.db !== null
  }

  setDb(db: Sqlite3DB): void {
    this.db = db
  }

  exec<T = Record<string, unknown>>(
    sql: string,
    params?: readonly unknown[],
  ): QueryResult<T> {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    const rows = this.db.exec(sql, {
      returnValue: 'resultRows',
      rowMode: 'object',
      bind: params as (string | number | null | bigint | Uint8Array | Int8Array | ArrayBuffer)[],
    }) as T[]

    return {
      rows,
      changes: this.db.changes(),
    }
  }

  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

export const sqliteWasmFactory: DatabaseFactory = {
  async init(config: DatabaseConfig): Promise<Database> {
    // Dynamic import to avoid loading WASM in test environment
    const sqlite3InitModule = (
      await import('@sqlite.org/sqlite-wasm')
    ).default

    const sqlite3 = await sqlite3InitModule()

    const wrapper = new SqliteWasmDatabase()

    if (config.mode === 'opfs-sahpool') {
      // Use SAH pool VFS for Safari compatibility (no sub-workers needed)
      const sahPoolUtil = await sqlite3.installOpfsSAHPoolVfs({
        clearOnInit: false,
        initialCapacity: 6,
      })

      const db = new sahPoolUtil.OpfsSAHPoolDb(config.filename)
      wrapper.setDb(db as unknown as Sqlite3DB)
    } else {
      // In-memory mode
      const db = new sqlite3.oo1.DB(':memory:')
      wrapper.setDb(db)
    }

    return wrapper
  },
}
