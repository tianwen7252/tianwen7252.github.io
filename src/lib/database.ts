/**
 * SQLite WASM database abstraction layer.
 * Supports OPFS persistence (browser) and in-memory mode (testing).
 */

// Re-export types for consumers
export interface DatabaseConfig {
  readonly filename: string
  readonly mode: 'opfs-sahpool' | 'memory'
}

export interface QueryResult<T = Record<string, unknown>> {
  readonly rows: readonly T[]
  readonly changes: number
}

export interface Database {
  readonly isReady: boolean
  exec<T = Record<string, unknown>>(
    sql: string,
    params?: readonly unknown[],
  ): QueryResult<T>
  close(): void
}

export interface DatabaseFactory {
  init(config: DatabaseConfig): Promise<Database>
}

// Default config for production (OPFS with SAH pool for Safari compatibility)
export const DEFAULT_CONFIG: DatabaseConfig = {
  filename: 'tianwen.db',
  mode: 'opfs-sahpool',
} as const

// In-memory config for testing
export const MEMORY_CONFIG: DatabaseConfig = {
  filename: ':memory:',
  mode: 'memory',
} as const
