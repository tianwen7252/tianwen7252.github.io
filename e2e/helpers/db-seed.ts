import type { Page } from '@playwright/test'
import {
  DB_NAME,
  COMMONDITY_TYPES,
  COMMONDITIES,
  ORDER_TYPES,
  EMPLOYEES,
  createTestOrders,
  createTestDailyData,
  createTestAttendances,
} from '../fixtures/test-data'
import { clearDatabase } from './db-clear'
import { waitForAppReady } from './wait-for-app'

/**
 * Seed data payload passed to page.evaluate().
 * Must be serializable (no functions, no class instances).
 */
interface SeedPayload {
  dbName: string
  commondityTypes: typeof COMMONDITY_TYPES
  commondities: typeof COMMONDITIES
  orderTypes: typeof ORDER_TYPES
  employees: typeof EMPLOYEES
  orders: ReturnType<typeof createTestOrders>
  dailyData: ReturnType<typeof createTestDailyData>
  attendances: ReturnType<typeof createTestAttendances>
}

/**
 * Seed the IndexedDB with test data.
 *
 * Flow:
 * 1. Navigate to the app to let it initialize the DB schema
 * 2. Wait for app to be ready (DB schema created by Dexie)
 * 3. Clear all existing data
 * 4. Inject test data via page.evaluate()
 * 5. Reload so the app picks up the seeded data
 */
export async function seedDatabase(page: Page): Promise<void> {
  // Step 1: Navigate to app root so Dexie initializes the DB
  await page.goto('/')
  await waitForAppReady(page)

  // Step 2: Clear existing data
  await clearDatabase(page)

  // Step 3: Prepare serializable seed payload
  const payload: SeedPayload = {
    dbName: DB_NAME,
    commondityTypes: COMMONDITY_TYPES,
    commondities: COMMONDITIES,
    orderTypes: ORDER_TYPES,
    employees: EMPLOYEES,
    orders: createTestOrders(),
    dailyData: createTestDailyData(),
    attendances: createTestAttendances(),
  }

  // Step 4: Inject test data into IndexedDB
  await page.evaluate(async (data: SeedPayload) => {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(data.dbName)

      request.onsuccess = () => {
        const db = request.result
        const storeNames = Array.from(db.objectStoreNames)

        // Build transaction over all stores we need to write
        const targetStores = [
          'commondityType',
          'commondity',
          'orderTypes',
          'employees',
          'orders',
          'dailyData',
          'attendances',
        ].filter(name => storeNames.includes(name))

        const tx = db.transaction(targetStores, 'readwrite')

        // Seed commondityType
        const typeStore = tx.objectStore('commondityType')
        data.commondityTypes.forEach(ct => typeStore.add(ct))

        // Seed commondity
        const comStore = tx.objectStore('commondity')
        data.commondities.forEach(c => comStore.add(c))

        // Seed orderTypes
        const otStore = tx.objectStore('orderTypes')
        data.orderTypes.forEach(ot => otStore.add(ot))

        // Seed employees
        const empStore = tx.objectStore('employees')
        data.employees.forEach(e => empStore.add(e))

        // Seed orders
        const orderStore = tx.objectStore('orders')
        data.orders.forEach(o => orderStore.add(o))

        // Seed dailyData
        const ddStore = tx.objectStore('dailyData')
        data.dailyData.forEach(d => ddStore.add(d))

        // Seed attendances
        const attStore = tx.objectStore('attendances')
        data.attendances.forEach(a => attStore.add(a))

        tx.oncomplete = () => {
          db.close()
          resolve()
        }
        tx.onerror = () => {
          db.close()
          reject(
            new Error(`Failed to seed database: ${tx.error?.message}`),
          )
        }
      }

      request.onerror = () => {
        reject(
          new Error(
            `Failed to open database for seeding: ${request.error?.message}`,
          ),
        )
      }
    })
  }, payload)

  // Step 5: Reload so app reads the seeded data
  await page.reload()
  await waitForAppReady(page)
}
