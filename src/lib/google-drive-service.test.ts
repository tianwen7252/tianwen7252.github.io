/**
 * Tests for Google Drive service — list and download backup files.
 * Covers correct API calls, response parsing, empty responses, and error handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Mocks ───────────────────────────────────────────────────────────────────

const mockFetch = vi.fn()

beforeEach(() => {
  mockFetch.mockReset()
  vi.stubGlobal('fetch', mockFetch)
})

afterEach(() => {
  vi.restoreAllMocks()
})

import {
  listDriveBackupFiles,
  downloadDriveFile,
  type DriveFile,
} from './google-drive-service'

// ── listDriveBackupFiles ────────────────────────────────────────────────────

describe('listDriveBackupFiles', () => {
  const TOKEN = 'test-access-token'

  it('makes correct API call with authorization and query params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ files: [] }),
    })

    await listDriveBackupFiles(TOKEN)

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, options] = mockFetch.mock.calls[0]!
    expect(url).toContain('https://www.googleapis.com/drive/v3/files')
    expect(url).toContain('orderBy=createdTime+desc')
    expect(url).toContain('pageSize=50')
    expect(options.headers.Authorization).toBe(`Bearer ${TOKEN}`)
  })

  it('returns parsed file list', async () => {
    const files: DriveFile[] = [
      {
        id: 'file-1',
        name: 'tianwen-backup-2026-03-29.db.gz',
        size: 1024,
        createdTime: '2026-03-29T10:00:00Z',
        mimeType: 'application/gzip',
      },
      {
        id: 'file-2',
        name: 'backup-daily-2026-03-28.db.gz',
        size: 2048,
        createdTime: '2026-03-28T10:00:00Z',
        mimeType: 'application/gzip',
      },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ files }),
    })

    const result = await listDriveBackupFiles(TOKEN)

    expect(result).toHaveLength(2)
    expect(result[0]).toBeDefined()
    expect(result[0]!.id).toBe('file-1')
    expect(result[0]!.name).toBe('tianwen-backup-2026-03-29.db.gz')
    expect(result[1]!.id).toBe('file-2')
  })

  it('returns empty array when no files found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ files: [] }),
    })

    const result = await listDriveBackupFiles(TOKEN)

    expect(result).toEqual([])
  })

  it('handles missing files field in response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    const result = await listDriveBackupFiles(TOKEN)

    expect(result).toEqual([])
  })

  it('throws on 401 (token expired)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    })

    await expect(listDriveBackupFiles(TOKEN)).rejects.toThrow(/401/)
  })

  it('throws on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(listDriveBackupFiles(TOKEN)).rejects.toThrow('Network error')
  })

  it('throws on non-OK response (500)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    await expect(listDriveBackupFiles(TOKEN)).rejects.toThrow(/500/)
  })
})

// ── downloadDriveFile ───────────────────────────────────────────────────────

describe('downloadDriveFile', () => {
  const TOKEN = 'test-access-token'
  const FILE_ID = 'file-abc-123'

  it('makes correct API call with authorization and alt=media', async () => {
    const buffer = new ArrayBuffer(8)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => buffer,
    })

    await downloadDriveFile(TOKEN, FILE_ID)

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, options] = mockFetch.mock.calls[0]!
    expect(url).toBe(
      `https://www.googleapis.com/drive/v3/files/${FILE_ID}?alt=media`,
    )
    expect(options.headers.Authorization).toBe(`Bearer ${TOKEN}`)
  })

  it('returns ArrayBuffer', async () => {
    const buffer = new ArrayBuffer(16)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => buffer,
    })

    const result = await downloadDriveFile(TOKEN, FILE_ID)

    expect(result).toBeInstanceOf(ArrayBuffer)
    expect(result.byteLength).toBe(16)
  })

  it('throws on error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    })

    await expect(downloadDriveFile(TOKEN, FILE_ID)).rejects.toThrow(/404/)
  })

  it('throws on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

    await expect(downloadDriveFile(TOKEN, FILE_ID)).rejects.toThrow(
      'Connection refused',
    )
  })
})
