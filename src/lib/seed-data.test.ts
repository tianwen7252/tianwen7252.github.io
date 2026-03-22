/**
 * Tests for seed data module.
 * Verifies seed data arrays have correct structure and values.
 */

import { describe, it, expect } from 'vitest'
import {
  SEED_EMPLOYEES,
  buildSeedAttendances,
  SEED_COMMONDITY_TYPES,
  SEED_COMMONDITIES,
} from './seed-data'

describe('Seed Data', () => {
  describe('SEED_COMMONDITY_TYPES', () => {
    it('has 4 categories', () => {
      expect(SEED_COMMONDITY_TYPES).toHaveLength(4)
    })

    it('contains bento, single, drink, dumpling typeIds', () => {
      const typeIds = SEED_COMMONDITY_TYPES.map((ct) => ct.typeId)
      expect(typeIds).toEqual(['bento', 'single', 'drink', 'dumpling'])
    })

    it('each item has required fields', () => {
      for (const ct of SEED_COMMONDITY_TYPES) {
        expect(ct.id).toBeTruthy()
        expect(ct.typeId).toBeTruthy()
        expect(ct.type).toBeTruthy()
        expect(ct.label).toBeTruthy()
        expect(typeof ct.createdAt).toBe('number')
        expect(typeof ct.updatedAt).toBe('number')
      }
    })

    it('has correct labels', () => {
      const labels = SEED_COMMONDITY_TYPES.map((ct) => ct.label)
      expect(labels).toEqual(['\u4fbf\u7576', '\u55ae\u9ede', '\u98f2\u6599', '\u6c34\u9903'])
    })
  })

  describe('SEED_COMMONDITIES', () => {
    it('has 15 bento items', () => {
      expect(SEED_COMMONDITIES).toHaveLength(15)
    })

    it('all items are bento type', () => {
      for (const com of SEED_COMMONDITIES) {
        expect(com.typeId).toBe('bento')
      }
    })

    it('all items have unique ids', () => {
      const ids = SEED_COMMONDITIES.map((com) => com.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('all items have image paths', () => {
      for (const com of SEED_COMMONDITIES) {
        expect(com.image).toBeTruthy()
        expect(com.image).toContain('images/commodities/')
      }
    })

    it('all items have positive prices', () => {
      for (const com of SEED_COMMONDITIES) {
        expect(com.price).toBeGreaterThan(0)
      }
    })

    it('all items are on market by default', () => {
      for (const com of SEED_COMMONDITIES) {
        expect(com.onMarket).toBe(true)
      }
    })

    it('has correct first and last item names', () => {
      expect(SEED_COMMONDITIES[0]!.name).toBe('\u6ef7\u8089\u4fbf\u7576')
      expect(SEED_COMMONDITIES[14]!.name).toBe('\u5496\u54e9\u96de\u4fbf\u7576')
    })
  })

  describe('SEED_EMPLOYEES', () => {
    it('has 11 employees', () => {
      expect(SEED_EMPLOYEES).toHaveLength(11)
    })
  })

  describe('buildSeedAttendances()', () => {
    it('returns a new array each call (immutable)', () => {
      const a1 = buildSeedAttendances()
      const a2 = buildSeedAttendances()
      expect(a1).not.toBe(a2)
      expect(a1).toEqual(a2)
    })
  })
})
