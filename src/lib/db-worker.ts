/**
 * Web Worker script for SQLite WASM + OPFS.
 * Runs in a dedicated worker thread; main thread communicates via postMessage.
 *
 * Vite processes this file via the URL constructor pattern, so @/ aliases work.
 */

import sqlite3InitModule from '@sqlite.org/sqlite-wasm'
import { CREATE_TABLES } from '@/lib/schema'
import { SEED_EMPLOYEES, buildSeedAttendances } from '@/lib/seed-data'
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

/** Seed employees and attendances into an empty database */
function seedData(database: Database): void {
  for (const emp of SEED_EMPLOYEES) {
    database.exec(
      `INSERT INTO employees (id, name, avatar, status, shift_type, employee_no, is_admin, hire_date, resignation_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        emp.id,
        emp.name,
        emp.avatar ?? null,
        emp.status,
        emp.shiftType,
        emp.employeeNo ?? null,
        emp.isAdmin ? 1 : 0,
        emp.hireDate ?? null,
        emp.resignationDate ?? null,
        emp.createdAt,
        emp.updatedAt,
      ],
    )
  }

  const attendances = buildSeedAttendances()
  for (const att of attendances) {
    database.exec(
      `INSERT INTO attendances (id, employee_id, date, clock_in, clock_out, type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        att.id,
        att.employeeId,
        att.date,
        att.clockIn ?? null,
        att.clockOut ?? null,
        att.type,
      ],
    )
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

      // Initialize schema
      db.exec('PRAGMA foreign_keys = ON')
      db.exec(CREATE_TABLES)

      // Clear all data if deleteSeedData is enabled (takes precedence)
      if (msg.deleteSeedData) {
        db.exec('DELETE FROM attendances')
        db.exec('DELETE FROM employees')
      }

      // Seed if enabled and employees table is empty
      if (msg.enableSeedData && !msg.deleteSeedData) {
        const result = db.exec<{ cnt: number }>(
          'SELECT COUNT(*) as cnt FROM employees',
        )
        if (result.rows[0]?.cnt === 0) {
          seedData(db)
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
