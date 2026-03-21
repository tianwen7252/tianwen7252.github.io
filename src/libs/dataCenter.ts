import Dexie, { type EntityTable } from 'dexie'
import { isNil } from 'lodash-es'

import { generate } from 'src/scripts/generator'
import * as API from './api'
import * as SYNC from 'src/constants/sync'
import { COMMODITIES } from 'src/constants/defaults/commondities'
import { getDeviceStorageInfo } from './common'

export const DB_NAME = 'TianwenDB'

const DB_VERSION = 12
export const db = new Dexie(DB_NAME) as Dexie & {
  orders: EntityTable<
    RestaDB.Table.Order,
    'id' // primary key "id" (for the typings only)
  >
  dailyData: EntityTable<RestaDB.Table.DailyData, 'id'>
  commondityType: EntityTable<RestaDB.Table.CommondityType, 'id'>
  commondity: EntityTable<RestaDB.Table.Commondity, 'id'>
  orderTypes: EntityTable<RestaDB.Table.OrderType, 'id'>
  employees: EntityTable<RestaDB.Table.Employee, 'id'>
  attendances: EntityTable<RestaDB.Table.Attendance, 'id'>
}

// Schema declaration — each version must be chained independently:

// v10: add isAdmin field to employees
db.version(10)
  .stores({
    orders: '++id, createdAt',
    dailyData: '++id, date, createdAt, total',
    commondityType: '++id, type',
    commondity: '++id, name, typeID, onMarket',
    orderTypes: '++id, name',
    employees: '++id, name, avatar, status, shiftType, employeeNo, isAdmin',
    attendances: '++id, employeeId, date, clockIn, clockOut',
  })
  .upgrade(async trans => {
    // v9→v10: add isAdmin field, default to false, first employee (001) is admin
    const employees = await trans.table('employees').orderBy('id').toArray()
    await Promise.all(
      employees.map(employee =>
        trans.table('employees').update(employee.id, {
          isAdmin: employee.employeeNo === '001',
        }),
      ),
    )
  })

// v11: add type field to attendances for vacation tracking
db.version(11)
  .stores({
    orders: '++id, createdAt',
    dailyData: '++id, date, createdAt, total',
    commondityType: '++id, type',
    commondity: '++id, name, typeID, onMarket',
    orderTypes: '++id, name',
    employees: '++id, name, avatar, status, shiftType, employeeNo, isAdmin',
    attendances: '++id, employeeId, date, clockIn, clockOut, type',
  })
  .upgrade(async trans => {
    // v10→v11: add type field to existing attendance records, default to 'regular'
    const attendanceRecords = await trans
      .table('attendances')
      .toArray()
    await Promise.all(
      attendanceRecords
        .filter(record => !record.type)
        .map(record =>
          trans.table('attendances').update(record.id, {
            type: 'regular',
          }),
        ),
    )
  })

// v12: add hireDate and resignationDate as indexed columns to employees.
// No .upgrade() needed — both fields are optional and default to undefined
// for existing rows; Dexie handles index rebuild automatically.
db.version(DB_VERSION)
  .stores({
    orders: '++id, createdAt',
    dailyData: '++id, date, createdAt, total',
    commondityType: '++id, type',
    commondity: '++id, name, typeID, onMarket',
    orderTypes: '++id, name',
    employees:
      '++id, name, avatar, status, shiftType, employeeNo, isAdmin, hireDate, resignationDate',
    attendances: '++id, employeeId, date, clockIn, clockOut, type',
  })

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
