import Dexie, { type EntityTable } from 'dexie'

import { generate } from 'src/scripts/generator'

const DB_NAME = 'TianWenDB'
const GB_UNIT = 1000 * 1000 * 1000
export const WARNING_DEVICE_SIZE = GB_UNIT

const DB_VERSION = 4
export const db = new Dexie(DB_NAME) as Dexie & {
  orders: EntityTable<
    RestaDB.Table.Order,
    'id' // primary key "id" (for the typings only)
  >
  dailyData: EntityTable<RestaDB.Table.DailyData, 'id'>
}

// Schema declaration:
const dbSchema = db.version(DB_VERSION)
dbSchema.stores({
  orders: '++id, createdAt', // primary key "id" (for the runtime!),
  dailyData: '++id, date, createdAt, total',
})
// .upgrade(trans => {
//   return trans
//     .table('orders')
//     .toCollection()
//     .modify(record => {
//       // do something
//     })
// })

export async function getDeviceStorageInfo(unit: 'bytes' | 'GB' = 'GB') {
  let percentageUsed = '0'
  let remaining = '0'
  if (navigator?.storage?.estimate) {
    const quota = await navigator.storage.estimate()
    const unitSize = unit === 'GB' ? GB_UNIT : 1
    // quota.usage -> Number of bytes used.
    // quota.quota -> Maximum number of bytes available.
    percentageUsed = ((quota.usage / quota.quota) * 100).toFixed(2)
    // console.log(`This app used ${percentageUsed}% of the available storage.`)
    remaining = ((quota.quota - quota.usage) / unitSize).toFixed(2)
    // console.log(`This app can write up to ${remaining} more ${unit}.`)
  }
  return {
    percentageUsed,
    remaining,
  }
}

// generate('orders', '1Q', true)
