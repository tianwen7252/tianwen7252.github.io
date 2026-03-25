/**
 * Default data module for initializing the database with application default data.
 * Raw data lives in @/constants/default-data for easy editing.
 * This file builds typed domain objects and handles database insertion and cleanup.
 */

import type { Employee, CommondityType, Commondity } from '@/lib/schemas'
import type { Database } from '@/lib/database'
import {
  EMPLOYEE_SEEDS,
  COMMODITY_TYPE_SEEDS,
  COMMODITY_SEEDS,
  UPDATE_DEFAULT_DATA_NUMBER,
} from '@/constants/default-data'

// ─── Storage key ────────────────────────────────────────────────────────────

const VERSION_KEY = 'UPDATE_DEFAULT_DATA_NUMBER'

// ─── Timestamp helpers ──────────────────────────────────────────────────────

const BASE_TS = 1700000000000

function daysAgo(days: number): number {
  return Date.now() - 86400000 * days
}

// ─── Build Employees ────────────────────────────────────────────────────────

const EMPLOYEE_TIMESTAMPS: Record<string, { createdAt: number; updatedAt: number }> = {
  'emp-001': { createdAt: daysAgo(365), updatedAt: BASE_TS },
  'emp-002': { createdAt: BASE_TS, updatedAt: daysAgo(15) },
  'emp-003': { createdAt: daysAgo(200), updatedAt: daysAgo(5) },
  'emp-004': { createdAt: daysAgo(60), updatedAt: daysAgo(2) },
  'emp-005': { createdAt: daysAgo(500), updatedAt: daysAgo(80) },
  'emp-006': { createdAt: BASE_TS, updatedAt: daysAgo(1) },
  'emp-007': { createdAt: daysAgo(50), updatedAt: daysAgo(3) },
  'emp-008': { createdAt: daysAgo(40), updatedAt: daysAgo(2) },
  'emp-009': { createdAt: daysAgo(25), updatedAt: daysAgo(1) },
  'emp-010': { createdAt: daysAgo(15), updatedAt: daysAgo(1) },
  'emp-011': { createdAt: daysAgo(10), updatedAt: daysAgo(1) },
}

export const DEFAULT_EMPLOYEES: readonly Employee[] = EMPLOYEE_SEEDS.map((seed) => {
  const ts = EMPLOYEE_TIMESTAMPS[seed.id] ?? { createdAt: BASE_TS, updatedAt: BASE_TS }
  return {
    ...seed,
    createdAt: ts.createdAt,
    updatedAt: ts.updatedAt,
  }
}) as readonly Employee[]

// ─── Build Commodity Types ──────────────────────────────────────────────────

export const DEFAULT_COMMODITY_TYPES: readonly CommondityType[] = COMMODITY_TYPE_SEEDS.map(
  (seed) => ({
    ...seed,
    createdAt: BASE_TS,
    updatedAt: BASE_TS,
  }),
) as readonly CommondityType[]

// ─── Build Commodities ──────────────────────────────────────────────────────

export const DEFAULT_COMMODITIES: readonly Commondity[] = COMMODITY_SEEDS.map((seed) => ({
  id: seed.id,
  typeId: seed.typeId,
  name: seed.name,
  image: seed.imageKey,
  price: seed.price,
  priority: seed.priority,
  onMarket: true,
  hideOnMode: seed.hideOnMode,
  includesSoup: seed.includesSoup ?? false,
  createdAt: BASE_TS,
  updatedAt: BASE_TS,
})) as readonly Commondity[]

// ─── LocalStorage version check ──────────────────────────────────────────────

/**
 * Returns true if the stored default-data version in localStorage differs
 * from the current UPDATE_DEFAULT_DATA_NUMBER constant, or if no version
 * has been stored yet.
 *
 * Must be called on the main thread (not inside a Web Worker).
 */
export function shouldResetDefaultData(): boolean {
  const stored = localStorage.getItem(VERSION_KEY)
  return stored !== String(UPDATE_DEFAULT_DATA_NUMBER)
}

/**
 * Writes the current UPDATE_DEFAULT_DATA_NUMBER into localStorage so that
 * subsequent app launches know the default data is already at this version.
 *
 * Must be called on the main thread (not inside a Web Worker).
 */
export function markDefaultDataVersion(): void {
  localStorage.setItem(VERSION_KEY, String(UPDATE_DEFAULT_DATA_NUMBER))
}

// ─── Database operations ─────────────────────────────────────────────────────

/**
 * Deletes only the known default data items from the database using their
 * well-known IDs. User-created data with other IDs is left untouched.
 */
export function deleteDefaultData(db: Database): void {
  const employeeIds = EMPLOYEE_SEEDS.map((s) => s.id)
  const typeIds = COMMODITY_TYPE_SEEDS.map((s) => s.id)
  const commodityIds = COMMODITY_SEEDS.map((s) => s.id)

  const placeholders = (ids: readonly string[]) => ids.map(() => '?').join(', ')

  db.exec(
    `DELETE FROM commondities WHERE id IN (${placeholders(commodityIds)})`,
    commodityIds,
  )

  db.exec(
    `DELETE FROM commondity_types WHERE id IN (${placeholders(typeIds)})`,
    typeIds,
  )

  db.exec(
    `DELETE FROM employees WHERE id IN (${placeholders(employeeIds)})`,
    employeeIds,
  )
}

/**
 * Deletes ALL rows from every table in the database.
 * This is a destructive operation intended for development resets only.
 */
export function clearAllData(db: Database): void {
  db.exec('DELETE FROM attendances')
  db.exec('DELETE FROM order_items')
  db.exec('DELETE FROM order_discounts')
  db.exec('DELETE FROM orders')
  db.exec('DELETE FROM commondities')
  db.exec('DELETE FROM commondity_types')
  db.exec('DELETE FROM order_types')
  db.exec('DELETE FROM daily_data')
  db.exec('DELETE FROM employees')
}

// ─── Database insertion ──────────────────────────────────────────────────────

/** Insert all default employees into the database. Skips existing rows. */
export function insertDefaultEmployees(db: Database): void {
  for (const emp of DEFAULT_EMPLOYEES) {
    db.exec(
      `INSERT OR IGNORE INTO employees (id, name, avatar, status, shift_type, employee_no, is_admin, hire_date, resignation_date, created_at, updated_at)
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
}

/** Insert all default commodity types and commodities into the database. Skips existing rows. */
export function insertDefaultCommodities(db: Database): void {
  for (const ct of DEFAULT_COMMODITY_TYPES) {
    db.exec(
      `INSERT OR IGNORE INTO commondity_types (id, type_id, type, label, color, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ct.id, ct.typeId, ct.type, ct.label, ct.color, ct.createdAt, ct.updatedAt],
    )
  }

  for (const com of DEFAULT_COMMODITIES) {
    db.exec(
      `INSERT OR IGNORE INTO commondities (id, type_id, name, image, price, priority, on_market, hide_on_mode, editor, includes_soup, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        com.id,
        com.typeId,
        com.name,
        com.image ?? null,
        com.price,
        com.priority,
        com.onMarket ? 1 : 0,
        com.hideOnMode ?? null,
        com.editor ?? null,
        com.includesSoup ? 1 : 0,
        com.createdAt,
        com.updatedAt,
      ],
    )
  }
}
