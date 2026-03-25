/**
 * Web Worker script for SQLite WASM + OPFS.
 * Runs in a dedicated worker thread; main thread communicates via postMessage.
 *
 * Vite processes this file via the URL constructor pattern, so @/ aliases work.
 */

import sqlite3InitModule from '@sqlite.org/sqlite-wasm'
import { initSchema } from '@/lib/schema'
import {
  insertDefaultEmployees,
  insertDefaultCommodities,
  deleteDefaultData,
  clearAllData,
} from '@/lib/default-data'
import type { WorkerRequest, WorkerResponse } from '@/lib/worker-database'
import type { Database } from '@/lib/database'

// ─── State ──────────────────────────────────────────────────────────────────

let db: Database | null = null

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Thin wrapper to adapt the SAHPool DB to our Database interface */
function wrapSahPoolDb(rawDb: unknown): Database {
  const d = rawDb as {
    exec: (sql: string, opts?: Record<string, unknown>) => unknown
    changes: () => number
    close: () => void
  }
  return {
    isReady: true,
    exec<T = Record<string, unknown>>(
      sql: string,
      params?: readonly unknown[],
    ) {
      const rows = d.exec(sql, {
        returnValue: 'resultRows',
        rowMode: 'object',
        bind: params ? [...params] : [],
      }) as T[]
      return { rows, changes: d.changes() }
    },
    close() {
      d.close()
    },
  }
}

// ─── Post typed messages ────────────────────────────────────────────────────

function post(msg: WorkerResponse): void {
  self.postMessage(msg)
}

// ─── Message handler ────────────────────────────────────────────────────────

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const msg = e.data

  if (msg.type === 'init') {
    try {
      const sqlite3 = await sqlite3InitModule()
      const sahPoolUtil = await sqlite3.installOpfsSAHPoolVfs({
        clearOnInit: false,
        initialCapacity: 6,
      })
      const rawDb = new sahPoolUtil.OpfsSAHPoolDb('tianwen.db')
      db = wrapSahPoolDb(rawDb)

      // Initialize schema + run migrations for existing DBs
      initSchema((sql: string) => db!.exec(sql))

      // Full wipe takes highest precedence
      if (msg.clearDbData) {
        clearAllData(db)
      } else if (msg.deleteDefaultData) {
        // Delete only default data items, leaving user-created data intact
        deleteDefaultData(db)
      }

      // Insert default data when enabled and not in a destructive mode
      if (msg.enableDefaultData && !msg.deleteDefaultData && !msg.clearDbData) {
        if (msg.shouldResetData) {
          // Version changed: clean slate for default items then re-insert
          deleteDefaultData(db)
          insertDefaultEmployees(db)
          insertDefaultCommodities(db)
        } else {
          // Insert only into empty tables
          const empCount = db.exec<{ cnt: number }>('SELECT COUNT(*) as cnt FROM employees')
          if (Number(empCount.rows[0]?.cnt) === 0) {
            insertDefaultEmployees(db)
          }

          const comCount = db.exec<{ cnt: number }>('SELECT COUNT(*) as cnt FROM commondities')
          if (Number(comCount.rows[0]?.cnt) === 0) {
            insertDefaultCommodities(db)
          }
        }
      }

      post({ type: 'init-done' })
    } catch (err) {
      post({ type: 'init-error', error: String(err) })
    }
  }

  if (msg.type === 'exec') {
    if (!db) {
      post({ type: 'exec-error', id: msg.id, error: 'Database not initialized' })
      return
    }

    try {
      const result = db.exec(msg.sql, msg.params)
      post({
        type: 'exec-result',
        id: msg.id,
        rows: [...result.rows],
        changes: result.changes,
      })
    } catch (err) {
      post({ type: 'exec-error', id: msg.id, error: String(err) })
    }
  }
}

// Signal readiness
post({ type: 'ready' })
