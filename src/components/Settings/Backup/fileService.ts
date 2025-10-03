import dayjs from 'dayjs'
import { DB_NAME } from 'src/libs/dataCenter'

const GDRIVE_UPLOAD_URL =
  'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable'
const GDRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files'

export function generateDefaultBackupName() {
  return `backup-${dayjs.tz().format('YYYY-MM-DD_HH-mm-ss')}.json`
}

/**
 * Export all IndexedDB object stores into a JSON blob.
 */
async function exportIndexedDB(): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME)
    request.onsuccess = async event => {
      const db = (event.target as IDBOpenDBRequest).result
      const tx = db.transaction(db.objectStoreNames as any, 'readonly')
      const exportData: Record<string, any[]> = {}
      let pending = db.objectStoreNames.length

      for (const storeName of db.objectStoreNames as any) {
        const store = tx.objectStore(storeName)
        const getAllReq = store.getAll()
        getAllReq.onsuccess = () => {
          exportData[storeName] = getAllReq.result
          if (--pending === 0) {
            resolve(
              new Blob([JSON.stringify(exportData)], {
                type: 'application/json',
              }),
            )
          }
        }
        getAllReq.onerror = reject
      }
    }
    request.onerror = reject
  })
}

/**
 * Initialize a resumable upload session with Google Drive.
 */
async function initResumableUpload(
  token: string,
  fileSize: number,
  fileName: string,
): Promise<string> {
  const res = await fetch(GDRIVE_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Length': fileSize.toString(),
      'X-Upload-Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: fileName,
      parents: ['1uYgRpQWjFOgfmZ_QaAm5elMHVMp0_lb-'],
    }),
  })
  if (!res.ok) throw new Error('Failed to initialize resumable upload')
  return res.headers.get('Location')!
}

/**
 * Perform the actual resumable upload in chunks.
 */
async function uploadFileResumable(
  token: string,
  blob: Blob,
  fileName: string,
  onProgress?: (percent: number) => void,
) {
  const uploadUrl = await initResumableUpload(token, blob.size, fileName)
  const chunkSize = 262144 // 256 KB
  let offset = 0

  while (offset < blob.size) {
    const chunk = blob.slice(offset, offset + chunkSize)
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Length': chunk.size.toString(),
        'Content-Range': `bytes ${offset}-${offset + chunk.size - 1}/${blob.size}`,
      },
      body: chunk,
    })

    if (res.status === 308) {
      // Partial success, continue uploading the next chunk
      offset += chunk.size
      if (onProgress) onProgress(Math.floor((offset / blob.size) * 100))
    } else if (res.ok) {
      // Upload complete
      if (onProgress) onProgress(100)
      return await res.json()
    } else {
      throw new Error(`Upload failed with status ${res.status}`)
    }
  }
}

/**
 * List backup files stored in Google Drive.
 */
export async function listDriveFiles(
  token: string,
): Promise<Resta.Backup.BackupFile[]> {
  const res = await fetch(
    `${GDRIVE_API_URL}?pageSize=5&orderBy=createdTime desc&fields=files(id,name,size,createdTime)`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  const data = await res.json()
  if (!res.ok) throw data
  const files = data?.files ?? []
  files.forEach(file => {
    file.size = formatFileSize(file.size)
  })
  return files
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

/**
 * Delete selected files from Google Drive.
 */
export async function deleteFiles(token: string, fileIds: string[]) {
  for (const id of fileIds) {
    await fetch(`${GDRIVE_API_URL}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  }
}

/**
 * Export IndexedDB data and upload it to Google Drive.
 */
export async function backupAndUpload(
  token: string,
  onProgress?: (percent: number) => void,
  fileName?: string,
) {
  const blob = await exportIndexedDB()
  const resolvedName =
    fileName && fileName.trim().length > 0
      ? fileName.trim()
      : generateDefaultBackupName()
  return await uploadFileResumable(token, blob, resolvedName, onProgress)
}

async function downloadBackup(token: string, fileId: string) {
  const res = await fetch(`${GDRIVE_API_URL}/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to download backup')
  return (await res.json()) as Record<string, any[]>
}

async function importIndexedDB(data: Record<string, any[]>) {
  return await new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME)
    request.onerror = () => reject(request.error)
    request.onsuccess = event => {
      const db = (event.target as IDBOpenDBRequest).result
      const storeNames = Array.from(db.objectStoreNames)
      const tx = db.transaction(storeNames, 'readwrite')
      tx.oncomplete = () => {
        db.close()
        resolve()
      }
      tx.onerror = () => {
        db.close()
        reject(tx.error)
      }
      storeNames.forEach(storeName => {
        const store = tx.objectStore(storeName)
        store.clear()
        const records = data[storeName] ?? []
        records.forEach(record => {
          store.put(record)
        })
      })
    }
  })
}

export async function restoreFromBackup(token: string, fileId: string) {
  const backupData = await downloadBackup(token, fileId)
  await importIndexedDB(backupData)
}
