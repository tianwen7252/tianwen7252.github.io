import { describe, it, expect } from 'vitest'
import { ANIMAL_AVATARS } from '../animalAvatars'

// Expected IDs based on actual files in public/images/aminals/
const EXPECTED_IDS = [
  '414686',
  '780258',
  '780260',
  '840492',
  '1049013',
  '1308845',
  '1326387',
  '1326390',
  '1326401',
  '1326405',
  '1810917',
  '1862418',
  '2523618',
  '2829735',
  '3500055',
  '3500329',
  '3544763',
  '3940404',
  '3940412',
  '4322991',
  '4775480',
  '4775505',
  '4775529',
  '4775608',
  '4775614',
  '4775621',
  '4775646',
  '10738692',
]

describe('ANIMAL_AVATARS', () => {
  it('should contain exactly 28 animal avatars', () => {
    expect(ANIMAL_AVATARS).toHaveLength(28)
  })

  it('should have unique IDs for all entries', () => {
    const ids = ANIMAL_AVATARS.map(a => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('should contain all expected avatar IDs', () => {
    const ids = ANIMAL_AVATARS.map(a => a.id)
    EXPECTED_IDS.forEach(expectedId => {
      expect(ids).toContain(expectedId)
    })
  })

  it('should have paths in the format "images/aminals/{id}.png"', () => {
    ANIMAL_AVATARS.forEach(avatar => {
      expect(avatar.path).toBe(`images/aminals/${avatar.id}.png`)
    })
  })

  it('should have non-empty string IDs for all entries', () => {
    ANIMAL_AVATARS.forEach(avatar => {
      expect(typeof avatar.id).toBe('string')
      expect(avatar.id.length).toBeGreaterThan(0)
    })
  })

  it('should have non-empty string paths for all entries', () => {
    ANIMAL_AVATARS.forEach(avatar => {
      expect(typeof avatar.path).toBe('string')
      expect(avatar.path.length).toBeGreaterThan(0)
    })
  })

  it('should have IDs sorted numerically', () => {
    const ids = ANIMAL_AVATARS.map(a => Number(a.id))
    const sortedIds = [...ids].sort((a, b) => a - b)
    expect(ids).toEqual(sortedIds)
  })

  it('should use relative paths without leading slash (Vite base: "./")', () => {
    ANIMAL_AVATARS.forEach(avatar => {
      expect(avatar.path).not.toMatch(/^\//)
    })
  })
})
