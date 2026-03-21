/**
 * Backup/restore service for SQLite database via Supabase Storage.
 * Exports the database as a gzipped file and uploads to Supabase Storage bucket.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export interface BackupConfig {
  readonly supabaseUrl: string
  readonly supabaseAnonKey: string
  readonly bucketName: string
}

export interface BackupMetadata {
  readonly filename: string
  readonly size: number
  readonly createdAt: string
}

export interface BackupService {
  exportDatabase(dbData: Uint8Array): Promise<Uint8Array>
  upload(data: Uint8Array, filename: string): Promise<BackupMetadata>
  download(filename: string): Promise<Uint8Array>
  restoreDatabase(compressed: Uint8Array): Promise<Uint8Array>
  listBackups(): Promise<readonly BackupMetadata[]>
}

/**
 * Compress data using gzip via the browser's CompressionStream API.
 */
export async function compress(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart])
    .stream()
    .pipeThrough(new CompressionStream('gzip'))

  const reader = stream.getReader()
  const chunks: Uint8Array[] = []

  let done = false
  while (!done) {
    const result = await reader.read()
    done = result.done
    if (result.value) {
      chunks.push(result.value)
    }
  }

  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const compressed = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    compressed.set(chunk, offset)
    offset += chunk.length
  }

  return compressed
}

/**
 * Decompress gzipped data using the browser's DecompressionStream API.
 */
export async function decompress(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'))

  const reader = stream.getReader()
  const chunks: Uint8Array[] = []

  let done = false
  while (!done) {
    const result = await reader.read()
    done = result.done
    if (result.value) {
      chunks.push(result.value)
    }
  }

  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const decompressed = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    decompressed.set(chunk, offset)
    offset += chunk.length
  }

  return decompressed
}

/**
 * Generate a timestamped backup filename.
 */
export function generateBackupFilename(): string {
  const now = new Date()
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return `tianwen-backup-${timestamp}.db.gz`
}

/**
 * Create a backup service backed by Supabase Storage.
 */
export function createBackupService(config: BackupConfig): BackupService {
  const supabase: SupabaseClient = createClient(
    config.supabaseUrl,
    config.supabaseAnonKey,
  )

  return {
    async exportDatabase(dbData: Uint8Array): Promise<Uint8Array> {
      return compress(dbData)
    },

    async upload(data: Uint8Array, filename: string): Promise<BackupMetadata> {
      const { error } = await supabase.storage
        .from(config.bucketName)
        .upload(filename, data, {
          contentType: 'application/gzip',
          upsert: true,
        })

      if (error) {
        throw new Error(`Upload failed: ${error.message}`)
      }

      return {
        filename,
        size: data.length,
        createdAt: new Date().toISOString(),
      }
    },

    async download(filename: string): Promise<Uint8Array> {
      const { data, error } = await supabase.storage
        .from(config.bucketName)
        .download(filename)

      if (error || !data) {
        throw new Error(`Download failed: ${error?.message ?? 'No data'}`)
      }

      return new Uint8Array(await data.arrayBuffer())
    },

    async restoreDatabase(compressed: Uint8Array): Promise<Uint8Array> {
      return decompress(compressed)
    },

    async listBackups(): Promise<readonly BackupMetadata[]> {
      const { data, error } = await supabase.storage
        .from(config.bucketName)
        .list('', {
          sortBy: { column: 'created_at', order: 'desc' },
        })

      if (error) {
        throw new Error(`List backups failed: ${error.message}`)
      }

      return (data ?? [])
        .filter(file => file.name.endsWith('.db.gz'))
        .map(file => ({
          filename: file.name,
          size: file.metadata?.size ?? 0,
          createdAt: file.created_at ?? new Date().toISOString(),
        }))
    },
  }
}
