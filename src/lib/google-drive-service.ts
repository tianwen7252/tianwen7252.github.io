/**
 * Google Drive service — list and download backup files via Drive API v3 REST.
 * Used for V1 database import from Google Drive backups.
 */

// ── Types ───────────────────────────────────────────────────────────────────

export interface DriveFile {
  readonly id: string
  readonly name: string
  readonly size: number
  readonly createdTime: string
  readonly mimeType: string
}

interface DriveListResponse {
  readonly files?: readonly DriveFile[]
}

// ── Constants ───────────────────────────────────────────────────────────────

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3/files'
const SEARCH_QUERY = "name contains 'tianwen' or name contains 'backup'"
const FIELDS = 'files(id,name,size,createdTime,mimeType)'
const ORDER_BY = 'createdTime desc'
const PAGE_SIZE = '50'

// ── Service functions ───────────────────────────────────────────────────────

/**
 * List backup files from the user's Google Drive.
 * Searches for files containing 'tianwen' or 'backup' in the name.
 * Results are sorted newest-first.
 */
export async function listDriveBackupFiles(
  accessToken: string,
): Promise<readonly DriveFile[]> {
  const params = new URLSearchParams({
    q: SEARCH_QUERY,
    fields: FIELDS,
    orderBy: ORDER_BY,
    pageSize: PAGE_SIZE,
  })

  const url = `${DRIVE_API_BASE}?${params.toString()}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(
      `Google Drive API error: ${response.status} ${response.statusText}`,
    )
  }

  const data = (await response.json()) as DriveListResponse
  return data.files ?? []
}

/**
 * Download a file from Google Drive by file ID.
 * Returns the raw file content as an ArrayBuffer.
 */
export async function downloadDriveFile(
  accessToken: string,
  fileId: string,
): Promise<ArrayBuffer> {
  const url = `${DRIVE_API_BASE}/${fileId}?alt=media`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(
      `Google Drive download error: ${response.status} ${response.statusText}`,
    )
  }

  return response.arrayBuffer()
}
