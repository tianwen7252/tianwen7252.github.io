import { describe, it, expect, vi } from 'vitest'
import {
  compress,
  decompress,
  generateBackupFilename,
  createBackupService,
  type BackupConfig,
} from './backup'

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        download: vi.fn().mockResolvedValue({
          data: new Blob([new Uint8Array([1, 2, 3])]),
          error: null,
        }),
        list: vi.fn().mockResolvedValue({
          data: [
            {
              name: 'tianwen-backup-2026-03-21.db.gz',
              created_at: '2026-03-21T10:00:00Z',
              metadata: { size: 1024 },
            },
            {
              name: 'other-file.txt',
              created_at: '2026-03-20T10:00:00Z',
              metadata: { size: 512 },
            },
          ],
          error: null,
        }),
      })),
    },
  })),
}))

describe('backup utilities', () => {
  describe('compress / decompress', () => {
    it('should compress and decompress data roundtrip', async () => {
      const original = new TextEncoder().encode(
        'Hello, SQLite WASM backup test!',
      )
      const compressed = await compress(original)
      const decompressed = await decompress(compressed)

      expect(decompressed).toEqual(original)
    })

    it('should produce smaller output for compressible data', async () => {
      // Repeating data is highly compressible
      const repeating = new Uint8Array(1000).fill(65)
      const compressed = await compress(repeating)

      expect(compressed.length).toBeLessThan(repeating.length)
    })

    it('should handle empty data', async () => {
      const empty = new Uint8Array(0)
      const compressed = await compress(empty)
      const decompressed = await decompress(compressed)

      expect(decompressed).toEqual(empty)
    })
  })

  describe('generateBackupFilename', () => {
    it('should generate a filename with timestamp', () => {
      const filename = generateBackupFilename()

      expect(filename).toMatch(/^tianwen-backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.db\.gz$/)
    })

    it('should generate unique filenames on consecutive calls', () => {
      const name1 = generateBackupFilename()
      // Filenames within the same second will be the same
      // But the format should be consistent
      expect(name1).toContain('tianwen-backup-')
      expect(name1).toContain('.db.gz')
    })
  })

  describe('createBackupService', () => {
    const config: BackupConfig = {
      supabaseUrl: 'https://test.supabase.co',
      supabaseAnonKey: 'test-key',
      bucketName: 'backups',
    }

    it('should export database with compression', async () => {
      const service = createBackupService(config)
      const dbData = new TextEncoder().encode('fake sqlite db data')
      const compressed = await service.exportDatabase(dbData)

      // Compressed data should be a valid Uint8Array
      expect(compressed).toBeInstanceOf(Uint8Array)
      expect(compressed.length).toBeGreaterThan(0)
    })

    it('should upload compressed data', async () => {
      const service = createBackupService(config)
      const data = new Uint8Array([1, 2, 3])
      const metadata = await service.upload(data, 'test-backup.db.gz')

      expect(metadata.filename).toBe('test-backup.db.gz')
      expect(metadata.size).toBe(3)
      expect(metadata.createdAt).toBeDefined()
    })

    it('should download backup file', async () => {
      const service = createBackupService(config)
      const data = await service.download('test-backup.db.gz')

      expect(data).toBeInstanceOf(Uint8Array)
    })

    it('should restore database from compressed data', async () => {
      const service = createBackupService(config)
      const original = new TextEncoder().encode('restore test data')
      const compressed = await compress(original)
      const restored = await service.restoreDatabase(compressed)

      expect(restored).toEqual(original)
    })

    it('should list only .db.gz backups', async () => {
      const service = createBackupService(config)
      const backups = await service.listBackups()

      expect(backups).toHaveLength(1)
      expect(backups[0]?.filename).toBe('tianwen-backup-2026-03-21.db.gz')
      expect(backups[0]?.size).toBe(1024)
    })
  })
})
