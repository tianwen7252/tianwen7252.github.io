import { describe, it, expect, vi } from 'vitest'

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('backup-config', () => {
  // Dynamic import is used because import.meta.env is read at call time,
  // so we stub env vars first, then import the module.

  describe('getBackupConfig', () => {
    it('should return env vars when set', async () => {
      vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key-123')
      vi.stubEnv('VITE_SUPABASE_BUCKET', 'my-bucket')

      const { getBackupConfig } = await import('./backup-config')
      const config = getBackupConfig()

      expect(config.supabaseUrl).toBe('https://test.supabase.co')
      expect(config.supabaseAnonKey).toBe('test-anon-key-123')
      expect(config.bucketName).toBe('my-bucket')

      vi.unstubAllEnvs()
    })

    it('should return empty strings when env vars are missing', async () => {
      vi.stubEnv('VITE_SUPABASE_URL', '')
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

      const { getBackupConfig } = await import('./backup-config')
      const config = getBackupConfig()

      expect(config.supabaseUrl).toBe('')
      expect(config.supabaseAnonKey).toBe('')

      vi.unstubAllEnvs()
    })

    it('should default bucketName to "backups" when bucket env var is not set', async () => {
      vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'key')
      // Do not stub VITE_SUPABASE_BUCKET — it should be undefined

      const { getBackupConfig } = await import('./backup-config')
      const config = getBackupConfig()

      // The nullish coalescing (??) falls through to 'backups'
      expect(config.bucketName).toBe('backups')

      vi.unstubAllEnvs()
    })
  })

  describe('isBackupConfigured', () => {
    it('should return true when both URL and key are set', async () => {
      vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key')

      const { isBackupConfigured } = await import('./backup-config')
      expect(isBackupConfigured()).toBe(true)

      vi.unstubAllEnvs()
    })

    it('should return false when URL is empty', async () => {
      vi.stubEnv('VITE_SUPABASE_URL', '')
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key')

      const { isBackupConfigured } = await import('./backup-config')
      expect(isBackupConfigured()).toBe(false)

      vi.unstubAllEnvs()
    })

    it('should return false when key is empty', async () => {
      vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

      const { isBackupConfigured } = await import('./backup-config')
      expect(isBackupConfigured()).toBe(false)

      vi.unstubAllEnvs()
    })

    it('should return false when both URL and key are empty', async () => {
      vi.stubEnv('VITE_SUPABASE_URL', '')
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

      const { isBackupConfigured } = await import('./backup-config')
      expect(isBackupConfigured()).toBe(false)

      vi.unstubAllEnvs()
    })
  })
})
