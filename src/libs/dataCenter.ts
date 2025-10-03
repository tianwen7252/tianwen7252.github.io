import Dexie, { type EntityTable } from 'dexie'
import { isNil } from 'lodash-es'

import { generate } from 'src/scripts/generator'
import * as API from './api'
import * as SYNC from 'src/constants/sync'
import { COMMODITIES } from 'src/constants/defaults/commondities'
import { getDeviceStorageInfo } from './common'

export const DB_NAME = 'TianwenDB'

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
  // getDeviceStorageInfo().then(({ useage, percentageUsed, remaining }) => {
  //   console.log(useage, percentageUsed, remaining)
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
    API.resetCommonditType(shouldSyncUpOnDev)
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
    API.resetOrderType(shouldSyncUpOnDev)
  }
  if (shouldSyncUpOnDev) {
    localStorage.setItem('SYNC_NUMBER', SYNC.NUMBER.toString())
  }
}

// generate('orders', '3Q', true)

// generate('orders', '2d', true)

// here we go
init()
