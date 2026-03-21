import { describe, it, expect } from 'vitest'
import {
  DEFAULT_CONFIG,
  MEMORY_CONFIG,
  type DatabaseConfig,
  type Database,
  type QueryResult,
} from './database'

describe('database config', () => {
  describe('DEFAULT_CONFIG', () => {
    it('should use opfs-sahpool mode for production', () => {
      expect(DEFAULT_CONFIG.mode).toBe('opfs-sahpool')
    })

    it('should use tianwen.db as filename', () => {
      expect(DEFAULT_CONFIG.filename).toBe('tianwen.db')
    })
  })

  describe('MEMORY_CONFIG', () => {
    it('should use memory mode for testing', () => {
      expect(MEMORY_CONFIG.mode).toBe('memory')
    })

    it('should use :memory: as filename', () => {
      expect(MEMORY_CONFIG.filename).toBe(':memory:')
    })
  })
})

describe('database interface contracts', () => {
  // These tests verify the type contracts compile correctly
  it('should define DatabaseConfig with filename and mode', () => {
    const config: DatabaseConfig = {
      filename: 'test.db',
      mode: 'memory',
    }
    expect(config.filename).toBe('test.db')
    expect(config.mode).toBe('memory')
  })

  it('should define QueryResult with rows and changes', () => {
    const result: QueryResult<{ id: string; name: string }> = {
      rows: [{ id: '1', name: 'test' }],
      changes: 0,
    }
    expect(result.rows).toHaveLength(1)
    expect(result.changes).toBe(0)
  })

  it('should define Database interface with isReady, exec, and close', () => {
    // Verify the interface shape compiles
    const mockDb: Database = {
      isReady: true,
      exec: <T>(_sql: string, _params?: readonly unknown[]) =>
        ({ rows: [] as T[], changes: 0 }) as QueryResult<T>,
      close: () => {},
    }
    expect(mockDb.isReady).toBe(true)
    expect(mockDb.exec('SELECT 1').rows).toEqual([])
    mockDb.close()
  })

  it('should support parameterized queries', () => {
    const mockDb: Database = {
      isReady: true,
      exec: <T>(_sql: string, _params?: readonly unknown[]) =>
        ({
          rows: [{ id: '1', name: 'test' }] as unknown as T[],
          changes: 1,
        }) as QueryResult<T>,
      close: () => {},
    }

    const result = mockDb.exec<{ id: string; name: string }>(
      'SELECT * FROM users WHERE id = ?',
      ['1'],
    )
    expect(result.rows[0]?.name).toBe('test')
  })
})
