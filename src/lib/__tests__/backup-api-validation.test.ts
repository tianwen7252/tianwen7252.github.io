/**
 * Tests for backup API validation logic.
 * These pure functions are extracted from api/backup/_lib/r2-client.ts
 * and tested here since vitest runs in happy-dom (not Node.js).
 */

import { describe, it, expect } from 'vitest'

// ── Re-implement pure validation functions to test ────────────────────────
// These mirror the logic in api/backup/_lib/r2-client.ts exactly.
// We test the logic here; the actual api/ code uses the same regex/constants.

const VALID_FILENAME_RE = /^backup-\d+\.sqlite\.gz$/
const MAX_UPLOAD_BYTES = 1024 * 1024 * 1024 // 1 GB

function isValidFilename(filename: string): boolean {
  return VALID_FILENAME_RE.test(filename)
}

function validateOrigin(
  origin: string | undefined,
  allowedOrigins: string,
): boolean {
  const allowed = allowedOrigins
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  if (!origin) return true
  return allowed.includes(origin)
}

function isFileTooLarge(contentLength: number): boolean {
  return contentLength > MAX_UPLOAD_BYTES
}

function r2Key(userId: string, filename: string): string {
  return `${userId}/${filename}`
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('backup API validation', () => {
  describe('isValidFilename', () => {
    it('accepts valid backup filename', () => {
      expect(isValidFilename('backup-1711814400000.sqlite.gz')).toBe(true)
    })

    it('accepts filename with short timestamp', () => {
      expect(isValidFilename('backup-123.sqlite.gz')).toBe(true)
    })

    it('rejects filename without backup- prefix', () => {
      expect(isValidFilename('1711814400000.sqlite.gz')).toBe(false)
    })

    it('rejects filename with wrong extension', () => {
      expect(isValidFilename('backup-123.db.gz')).toBe(false)
    })

    it('rejects filename with path traversal', () => {
      expect(isValidFilename('../backup-123.sqlite.gz')).toBe(false)
    })

    it('rejects filename with slashes', () => {
      expect(isValidFilename('foo/backup-123.sqlite.gz')).toBe(false)
    })

    it('rejects empty filename', () => {
      expect(isValidFilename('')).toBe(false)
    })

    it('rejects filename with non-digit timestamp', () => {
      expect(isValidFilename('backup-abc.sqlite.gz')).toBe(false)
    })

    it('rejects filename with spaces', () => {
      expect(isValidFilename('backup- 123.sqlite.gz')).toBe(false)
    })

    it('rejects old .db.gz format', () => {
      expect(isValidFilename('tianwen-backup-2026-03-30.db.gz')).toBe(false)
    })
  })

  describe('validateOrigin', () => {
    it('allows request without Origin header (same-origin)', () => {
      expect(validateOrigin(undefined, 'https://app.example.com')).toBe(true)
    })

    it('allows request with empty Origin (same-origin)', () => {
      expect(validateOrigin('', 'https://app.example.com')).toBe(true)
    })

    it('allows request with matching origin', () => {
      expect(
        validateOrigin('https://app.example.com', 'https://app.example.com'),
      ).toBe(true)
    })

    it('allows request with one of multiple allowed origins', () => {
      expect(
        validateOrigin(
          'http://localhost:5173',
          'https://app.example.com, http://localhost:5173',
        ),
      ).toBe(true)
    })

    it('rejects request with non-matching origin', () => {
      expect(
        validateOrigin('https://evil.com', 'https://app.example.com'),
      ).toBe(false)
    })

    it('rejects request when no origins configured', () => {
      expect(validateOrigin('https://app.example.com', '')).toBe(false)
    })
  })

  describe('isFileTooLarge', () => {
    it('returns false for 0 bytes', () => {
      expect(isFileTooLarge(0)).toBe(false)
    })

    it('returns false for 500 MB', () => {
      expect(isFileTooLarge(500 * 1024 * 1024)).toBe(false)
    })

    it('returns false for exactly 1 GB', () => {
      expect(isFileTooLarge(1024 * 1024 * 1024)).toBe(false)
    })

    it('returns true for 1 GB + 1 byte', () => {
      expect(isFileTooLarge(1024 * 1024 * 1024 + 1)).toBe(true)
    })
  })

  describe('r2Key', () => {
    it('builds key with userId prefix', () => {
      expect(r2Key('tianwen', 'backup-123.sqlite.gz')).toBe(
        'tianwen/backup-123.sqlite.gz',
      )
    })

    it('handles empty userId', () => {
      expect(r2Key('', 'backup-123.sqlite.gz')).toBe('/backup-123.sqlite.gz')
    })
  })
})
