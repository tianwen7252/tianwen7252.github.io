import type { Page } from '@playwright/test'
import { DB_NAME } from '../fixtures/test-data'

/**
 * Clear all tables in the TianwenDB IndexedDB database.
 * Operates via page.evaluate() to run inside the browser context.
 */
export async function clearDatabase(page: Page): Promise<void> {
  await page.evaluate(async (dbName: string) => {
    const TABLE_NAMES = [
      'orders',
      'dailyData',
      'commondityType',
      'commondity',
      'orderTypes',
      'employees',
      'attendances',
    ]

    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(dbName)

      request.onsuccess = () => {
        const db = request.result
        const storeNames = Array.from(db.objectStoreNames)

        if (storeNames.length === 0) {
          db.close()
          resolve()
          return
        }

        // Only clear tables that exist in the current DB
        const tablesToClear = TABLE_NAMES.filter((name) =>
          storeNames.includes(name),
        )

        if (tablesToClear.length === 0) {
          db.close()
          resolve()
          return
        }

        const tx = db.transaction(tablesToClear, 'readwrite')
        tablesToClear.forEach((name) => {
          tx.objectStore(name).clear()
        })

        tx.oncomplete = () => {
          db.close()
          resolve()
        }
        tx.onerror = () => {
          db.close()
          reject(new Error(`Failed to clear database: ${tx.error?.message}`))
        }
      }

      request.onerror = () => {
        reject(
          new Error(
            `Failed to open database: ${request.error?.message}`,
          ),
        )
      }
    })
  }, DB_NAME)
}
