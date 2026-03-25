/**
 * V2-55: Historical order data migration.
 * Reads all orders and normalizes their legacy JSON `data` blobs
 * into the `order_items` and `order_discounts` relational tables.
 * Idempotent: orders with existing rows in either table are skipped.
 */

import { nanoid } from 'nanoid'
import type { Database } from '@/lib/database'
import type { OrderData } from '@/lib/schemas'

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_NAME_LENGTH = 512
const MAX_LABEL_LENGTH = 256
const MAX_ID_LENGTH = 128

// ─── Types ────────────────────────────────────────────────────────────────────

interface MigratedItem {
  readonly commodityId: string
  readonly name: string
  readonly price: number
  readonly quantity: number
}

interface MigratedDiscount {
  readonly label: string
  readonly amount: number
}

interface ParseResult {
  readonly items: readonly MigratedItem[]
  readonly discounts: readonly MigratedDiscount[]
}

// ─── Parsing ──────────────────────────────────────────────────────────────────

function isQuantityEntry(entry: OrderData, comID: string): boolean {
  return (
    entry.comID === comID &&
    entry.res === 'qty' &&
    entry.operator === '*' &&
    entry.type !== 'discount' &&
    entry.amount !== undefined
  )
}

/**
 * Migration-specific parser that preserves comID for commodity_id.
 * Handles qty multipliers (adjacent, same comID) and discount entries.
 * Malformed entries are silently skipped.
 */
function parseLegacyData(data: readonly OrderData[]): ParseResult {
  const items: MigratedItem[] = []
  const discounts: MigratedDiscount[] = []
  let i = 0

  while (i < data.length) {
    const entry = data[i]!

    if (entry.type === 'discount') {
      if (entry.res && entry.amount !== undefined) {
        const amount = Math.abs(Number(entry.amount))
        const label = String(entry.res).slice(0, MAX_LABEL_LENGTH)
        if (Number.isFinite(amount)) discounts.push({ label, amount })
      }
      i++
      continue
    }

    if (entry.comID !== undefined && entry.value !== undefined && entry.amount !== undefined) {
      const price = Number(entry.amount)
      if (Number.isFinite(price)) {
        let quantity = 1
        let consumedNext = false
        const next = data[i + 1]
        if (next && isQuantityEntry(next, entry.comID)) {
          const qty = Number(next.amount)
          if (Number.isInteger(qty) && qty > 0) { quantity = qty; consumedNext = true }
        }
        const name = String(entry.value).slice(0, MAX_NAME_LENGTH)
        items.push({ commodityId: entry.comID, name, price, quantity })
        if (consumedNext) i++
      }
    }
    i++
  }

  return { items, discounts }
}

// ─── DB helpers ───────────────────────────────────────────────────────────────

/** Inserts one item row into order_items (includes_soup defaults to 0) */
function insertItem(db: Database, orderId: string, item: MigratedItem, now: number): void {
  db.exec(
    `INSERT INTO order_items (id, order_id, commodity_id, name, price, quantity, includes_soup, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nanoid(), orderId, item.commodityId, item.name, item.price, item.quantity, 0, now],
  )
}

/** Inserts one discount row into order_discounts */
function insertDiscount(db: Database, orderId: string, discount: MigratedDiscount, now: number): void {
  db.exec(
    `INSERT INTO order_discounts (id, order_id, label, amount, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [nanoid(), orderId, discount.label, discount.amount, now],
  )
}

/** Runs all inserts for one order inside a transaction; rolls back on error */
function migrateOrder(db: Database, orderId: string, parsed: ParseResult): void {
  db.exec('BEGIN')
  try {
    const now = Date.now()
    for (const item of parsed.items) insertItem(db, orderId, item, now)
    for (const discount of parsed.discounts) insertDiscount(db, orderId, discount, now)
    db.exec('COMMIT')
  } catch (err) {
    db.exec('ROLLBACK')
    console.error(`[migrateData] Failed to migrate order ${orderId}:`, err)
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Migrate all legacy order data into normalized relational tables.
 * Selects only unmigrated orders (no existing items or discounts),
 * parses the data JSON, and inserts within a transaction.
 */
export function migrateData(db: Database): void {
  // Only load orders that have no items AND no discounts yet — avoids N+1 COUNTs
  // and prevents loading data blobs for already-migrated orders.
  const { rows } = db.exec<{ id: string; data: string }>(
    `SELECT id, data FROM orders
     WHERE NOT EXISTS (SELECT 1 FROM order_items    WHERE order_id = orders.id)
       AND NOT EXISTS (SELECT 1 FROM order_discounts WHERE order_id = orders.id)`,
  )

  if (rows.length === 0) return

  for (const row of rows) {
    const orderId = String(row.id)

    // Guard against corrupted id values that could produce bad FK references
    if (!orderId || orderId.length > MAX_ID_LENGTH || orderId === '[object Object]') continue

    let parsed: ParseResult
    try {
      const raw: unknown = JSON.parse(String(row.data))
      parsed = parseLegacyData(Array.isArray(raw) ? (raw as OrderData[]) : [])
    } catch (err) {
      console.warn(`[migrateData] Skipping order ${orderId}: malformed JSON —`, err)
      continue
    }

    if (parsed.items.length === 0 && parsed.discounts.length === 0) continue

    migrateOrder(db, orderId, parsed)
  }
}
