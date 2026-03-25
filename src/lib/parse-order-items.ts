/**
 * Parse raw OrderData arrays into structured items and discounts.
 * Handles quantity multipliers and gracefully skips malformed entries.
 */

import type { OrderData } from '@/lib/schemas'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ParsedItem {
  readonly name: string
  readonly quantity: number
  readonly unitPrice: number
}

export interface ParsedDiscount {
  readonly label: string
  /** Discount amount as a positive value */
  readonly amount: number
}

export interface ParsedOrderItems {
  readonly items: readonly ParsedItem[]
  readonly discounts: readonly ParsedDiscount[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Check if a value is a valid finite number */
function isValidNumber(value: number): boolean {
  return Number.isFinite(value)
}

/** Check if an entry is a quantity multiplier for the given comID */
function isQuantityEntry(entry: OrderData, comID: string): boolean {
  return (
    entry.comID === comID &&
    entry.res === 'qty' &&
    entry.operator === '*' &&
    entry.type !== 'discount' &&
    entry.amount !== undefined
  )
}

/** Check if an entry is a discount */
function isDiscount(entry: OrderData): boolean {
  return entry.type === 'discount'
}

/** Check if an entry is a valid item (has comID, value, and amount) */
function isValidItem(entry: OrderData): boolean {
  return (
    entry.comID !== undefined &&
    entry.value !== undefined &&
    entry.amount !== undefined
  )
}

// ─── Main Function ──────────────────────────────────────────────────────────

/**
 * Parse an array of OrderData into structured items and discounts.
 *
 * Items: entries with comID, value (name), and amount (price).
 * Quantity multipliers MUST immediately follow their parent item entry
 * (same comID, res='qty', operator='*'). This adjacency contract is
 * guaranteed by the order submission logic in order-store.ts.
 *
 * Discounts: entries with type='discount', res (label), amount (negative -> positive).
 *
 * Malformed entries are silently skipped.
 */
export function parseOrderItems(data: readonly OrderData[]): ParsedOrderItems {
  // Two-pass approach: first collect parsed entries, then split into items/discounts
  const parsed = collectEntries(data)
  return {
    items: parsed.filter((e): e is ParsedItem => 'unitPrice' in e),
    discounts: parsed.filter((e): e is ParsedDiscount => 'label' in e && !('unitPrice' in e)),
  }
}

/** Intermediate union type for collected entries */
type ParsedEntry = ParsedItem | ParsedDiscount

/** Walk through data entries and collect parsed items and discounts */
function collectEntries(data: readonly OrderData[]): readonly ParsedEntry[] {
  const results: ParsedEntry[] = []

  let i = 0
  while (i < data.length) {
    const entry = data[i]!

    // Handle discount entries
    if (isDiscount(entry)) {
      const discount = tryParseDiscount(entry)
      if (discount) results.push(discount)
      i++
      continue
    }

    // Handle item entries
    if (isValidItem(entry)) {
      const item = tryParseItem(entry, data[i + 1])
      if (item) {
        results.push(item.parsed)
        if (item.consumedNext) i++ // Skip the quantity entry
      }
      i++
      continue
    }

    // Skip malformed entries
    i++
  }

  return results
}

/** Try to parse a discount entry; returns null if invalid */
function tryParseDiscount(entry: OrderData): ParsedDiscount | null {
  if (!entry.res || entry.amount === undefined) return null
  const amount = Math.abs(Number(entry.amount))
  return isValidNumber(amount) ? { label: entry.res, amount } : null
}

/** Try to parse an item entry with optional quantity lookahead */
function tryParseItem(
  entry: OrderData,
  next: OrderData | undefined,
): { readonly parsed: ParsedItem; readonly consumedNext: boolean } | null {
  const unitPrice = Number(entry.amount)
  if (!isValidNumber(unitPrice)) return null

  let quantity = 1
  let consumedNext = false

  if (next && isQuantityEntry(next, entry.comID!)) {
    const qty = Number(next.amount)
    if (isValidNumber(qty)) {
      quantity = qty
    }
    consumedNext = true
  }

  return {
    parsed: { name: entry.value!, quantity, unitPrice },
    consumedNext,
  }
}
