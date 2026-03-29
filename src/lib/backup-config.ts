// ─── Types ──────────────────────────────────────────────────────────────────

export interface BackupConfig {
  readonly supabaseUrl: string
  readonly supabaseAnonKey: string
  readonly bucketName: string
}

// ─── Config ─────────────────────────────────────────────────────────────────

/**
 * Read Supabase backup configuration from environment variables.
 * Returns empty strings for missing values so callers can check with
 * isBackupConfigured().
 */
export function getBackupConfig(): BackupConfig {
  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
    bucketName: import.meta.env.VITE_SUPABASE_BUCKET ?? 'backups',
  }
}

/**
 * Check whether Supabase backup credentials are configured.
 * Both the URL and anon key must be non-empty.
 */
export function isBackupConfigured(): boolean {
  const config = getBackupConfig()
  return config.supabaseUrl.length > 0 && config.supabaseAnonKey.length > 0
}
