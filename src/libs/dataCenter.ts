import Dexie, { type EntityTable } from 'dexie'
import { isNil } from 'lodash'

import { generate } from 'src/scripts/generator'
import * as API from './api'
import {
  COMMODITY_TYPES,
  COMMODITIES,
} from 'src/constants/defaults/commondities'
import { ORDER_TYPES } from 'src/constants/defaults/orderTypes'
import * as SYNC from 'src/constants/sync'

const DB_NAME = 'TianwenDB'
const GB_UNIT = 1000 * 1000 * 1000
export const WARNING_DEVICE_SIZE = GB_UNIT

const DB_VERSION = 7
export const db = new Dexie(DB_NAME) as Dexie & {
  orders: EntityTable<
    RestaDB.Table.Order,
    'id' // primary key "id" (for the typings only)
  >
  dailyData: EntityTable<RestaDB.Table.DailyData, 'id'>
  commondityType: EntityTable<RestaDB.Table.CommondityType, 'id'>
  commondity: EntityTable<RestaDB.Table.Commondity, 'id'>
  orderTypes: EntityTable<RestaDB.Table.OrderType, 'id'>
}

// Schema declaration:
const dbSchema = db.version(DB_VERSION)
dbSchema.stores({
  orders: '++id, createdAt', // primary key "id" (for the runtime!),
  dailyData: '++id, date, createdAt, total',
  commondityType: '++id, type',
  commondity: '++id, name, typeID, onMarket',
  orderTypes: '++id, name',
})
// .upgrade(trans => {
//   return trans
//     .table('orders')
//     .toCollection()
//     .modify(record => {
//       // do something
//     })
// })

export function init() {
  initDB()
  // getDeviceStorageInfo().then(({ percentageUsed, remaining, unit }) => {
  //   console.log(percentageUsed, remaining, unit)
  // })
}

export async function initDB() {
  // init commondity type and commondities here
  // also sycn up for dev only
  const syncNumber = localStorage.getItem('SYNC_NUMBER')
  const shouldSyncUpOnDev = isNil(syncNumber) || SYNC.NUMBER > +syncNumber
  syncNumber && SYNC.METHOD === 'dev' && SYNC.SOURDCE === 'default'
  const syncTable = shouldSyncUpOnDev && SYNC.SPECIFIC_TABLE

  const commondityTypes = await API.commondityTypes.get()
  if (commondityTypes.length === 0 || syncTable === 'commondityType') {
    shouldSyncUpOnDev && API.commondityTypes.clear()
    COMMODITY_TYPES.forEach(type => {
      API.commondityTypes.add(type)
    })
  }
  const commondities = await API.commondity.get()
  if (commondities.length === 0 || syncTable === 'commondity') {
    const typesData = await API.commondityTypes.get()
    const typesMap = typesData.reduce((map, data) => {
      map[data.type] = data.typeID
      return map
    }, {})
    shouldSyncUpOnDev && API.commondity.clear()
    COMMODITIES.forEach(commodity => {
      const { type, items } = commodity
      items.forEach(item => {
        API.commondity.add({
          ...item,
          typeID: typesMap[type],
          onMarket: '1',
        })
      })
    })
  }
  // init order types
  const orderTypes = await API.orderTypes.get()
  if (orderTypes.length === 0 || syncTable === 'orderTypes') {
    shouldSyncUpOnDev && API.orderTypes.clear()
    ORDER_TYPES.forEach(type => {
      API.orderTypes.add(type)
    })
  }
  if (shouldSyncUpOnDev) {
    localStorage.setItem('SYNC_NUMBER', SYNC.NUMBER.toString())
  }
}

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
    unit,
  }
}

// generate('orders', '3Q', true)

// generate('orders', '2d', true)

// here we go
init()
