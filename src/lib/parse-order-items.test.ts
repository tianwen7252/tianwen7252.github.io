/**
 * Tests for parseOrderItems utility.
 * Verifies correct parsing of OrderData arrays into parsed items and discounts.
 */

import { describe, it, expect } from 'vitest'
import type { OrderData } from '@/lib/schemas'
import { parseOrderItems } from './parse-order-items'

describe('parseOrderItems', () => {
  // ─── single item with default quantity ────────────────────────────────────

  describe('single item with default quantity', () => {
    it('parses a single item with quantity 1', () => {
      const data: readonly OrderData[] = [
        { comID: 'com-001', value: '滷肉便當', amount: '100' },
      ]

      const result = parseOrderItems(data)

      expect(result.items).toEqual([
        { name: '滷肉便當', quantity: 1, unitPrice: 100 },
      ])
      expect(result.discounts).toEqual([])
    })
  })

  // ─── item with quantity multiplier ────────────────────────────────────────

  describe('item with quantity multiplier', () => {
    it('parses item followed by quantity entry', () => {
      const data: readonly OrderData[] = [
        { comID: 'com-001', value: '滷肉便當', amount: '100' },
        { comID: 'com-001', res: 'qty', operator: '*', amount: '3' },
      ]

      const result = parseOrderItems(data)

      expect(result.items).toEqual([
        { name: '滷肉便當', quantity: 3, unitPrice: 100 },
      ])
    })
  })

  // ─── multiple items ───────────────────────────────────────────────────────

  describe('multiple items', () => {
    it('parses multiple different items', () => {
      const data: readonly OrderData[] = [
        { comID: 'com-001', value: '滷肉便當', amount: '100' },
        { comID: 'com-002', value: '雞腿飯', amount: '120' },
      ]

      const result = parseOrderItems(data)

      expect(result.items).toHaveLength(2)
      expect(result.items[0]).toEqual({ name: '滷肉便當', quantity: 1, unitPrice: 100 })
      expect(result.items[1]).toEqual({ name: '雞腿飯', quantity: 1, unitPrice: 120 })
    })

    it('parses multiple items with mixed quantities', () => {
      const data: readonly OrderData[] = [
        { comID: 'com-001', value: '滷肉便當', amount: '100' },
        { comID: 'com-001', res: 'qty', operator: '*', amount: '2' },
        { comID: 'com-002', value: '雞腿飯', amount: '120' },
      ]

      const result = parseOrderItems(data)

      expect(result.items).toHaveLength(2)
      expect(result.items[0]).toEqual({ name: '滷肉便當', quantity: 2, unitPrice: 100 })
      expect(result.items[1]).toEqual({ name: '雞腿飯', quantity: 1, unitPrice: 120 })
    })
  })

  // ─── item with discount ─────────────────────────────────────────────────

  describe('item with discount', () => {
    it('parses discount entries separately from items', () => {
      const data: readonly OrderData[] = [
        { comID: 'com-001', value: '滷肉便當', amount: '100' },
        { type: 'discount', res: '員工折扣', amount: '-20' },
      ]

      const result = parseOrderItems(data)

      expect(result.items).toEqual([
        { name: '滷肉便當', quantity: 1, unitPrice: 100 },
      ])
      expect(result.discounts).toEqual([
        { label: '員工折扣', amount: 20 },
      ])
    })

    it('converts negative discount amount to positive', () => {
      const data: readonly OrderData[] = [
        { type: 'discount', res: '九折優惠', amount: '-50' },
      ]

      const result = parseOrderItems(data)

      expect(result.discounts).toEqual([
        { label: '九折優惠', amount: 50 },
      ])
    })

    it('handles discount with already positive amount', () => {
      const data: readonly OrderData[] = [
        { type: 'discount', res: '會員優惠', amount: '30' },
      ]

      const result = parseOrderItems(data)

      expect(result.discounts).toEqual([
        { label: '會員優惠', amount: 30 },
      ])
    })

    it('parses multiple discounts', () => {
      const data: readonly OrderData[] = [
        { comID: 'com-001', value: '滷肉便當', amount: '100' },
        { type: 'discount', res: '員工折扣', amount: '-20' },
        { type: 'discount', res: '老客戶優惠', amount: '-10' },
      ]

      const result = parseOrderItems(data)

      expect(result.discounts).toHaveLength(2)
      expect(result.discounts[0]).toEqual({ label: '員工折扣', amount: 20 })
      expect(result.discounts[1]).toEqual({ label: '老客戶優惠', amount: 10 })
    })
  })

  // ─── empty data array ─────────────────────────────────────────────────────

  describe('empty data array', () => {
    it('returns empty items and discounts for empty array', () => {
      const result = parseOrderItems([])

      expect(result.items).toEqual([])
      expect(result.discounts).toEqual([])
    })
  })

  // ─── malformed entries ────────────────────────────────────────────────────

  describe('malformed entries', () => {
    it('skips entries with missing comID and no type', () => {
      const data: readonly OrderData[] = [
        { value: '滷肉便當', amount: '100' },
      ]

      const result = parseOrderItems(data)

      expect(result.items).toEqual([])
      expect(result.discounts).toEqual([])
    })

    it('skips entries with missing value (name)', () => {
      const data: readonly OrderData[] = [
        { comID: 'com-001', amount: '100' },
      ]

      const result = parseOrderItems(data)

      expect(result.items).toEqual([])
    })

    it('skips entries with missing amount', () => {
      const data: readonly OrderData[] = [
        { comID: 'com-001', value: '滷肉便當' },
      ]

      const result = parseOrderItems(data)

      expect(result.items).toEqual([])
    })

    it('skips discount entries with missing res (label)', () => {
      const data: readonly OrderData[] = [
        { type: 'discount', amount: '-20' },
      ]

      const result = parseOrderItems(data)

      expect(result.discounts).toEqual([])
    })

    it('skips discount entries with missing amount', () => {
      const data: readonly OrderData[] = [
        { type: 'discount', res: '員工折扣' },
      ]

      const result = parseOrderItems(data)

      expect(result.discounts).toEqual([])
    })

    it('handles non-numeric amount strings gracefully', () => {
      const data: readonly OrderData[] = [
        { comID: 'com-001', value: '滷肉便當', amount: 'abc' },
      ]

      const result = parseOrderItems(data)

      // NaN amounts should be skipped
      expect(result.items).toEqual([])
    })

    it('handles quantity entry without matching item', () => {
      const data: readonly OrderData[] = [
        { comID: 'com-001', res: 'qty', operator: '*', amount: '3' },
      ]

      const result = parseOrderItems(data)

      // Orphan quantity entries should be ignored
      expect(result.items).toEqual([])
    })

    it('mixed valid and malformed entries only returns valid ones', () => {
      const data: readonly OrderData[] = [
        { comID: 'com-001', value: '滷肉便當', amount: '100' },
        { comID: 'com-002' },  // missing value and amount
        { comID: 'com-003', value: '雞腿飯', amount: '120' },
        { type: 'discount', res: '優惠', amount: '-10' },
        { type: 'discount' },  // missing res and amount
      ]

      const result = parseOrderItems(data)

      expect(result.items).toHaveLength(2)
      expect(result.items[0]!.name).toBe('滷肉便當')
      expect(result.items[1]!.name).toBe('雞腿飯')
      expect(result.discounts).toHaveLength(1)
      expect(result.discounts[0]!.label).toBe('優惠')
    })
  })

  // ─── return type immutability ─────────────────────────────────────────────

  describe('return type', () => {
    it('returns readonly arrays', () => {
      const data: readonly OrderData[] = [
        { comID: 'com-001', value: '滷肉便當', amount: '100' },
      ]

      const result = parseOrderItems(data)

      // Verify the structure shape is correct
      expect(Array.isArray(result.items)).toBe(true)
      expect(Array.isArray(result.discounts)).toBe(true)
    })
  })
})
