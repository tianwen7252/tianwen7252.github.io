import { db } from 'src/libs/dataCenter'
import dayjs from 'dayjs'
import type { Collection } from 'dexie'

export const orders = {
  get({
    startTime,
    endTime,
    reverse = true,
    index = 'createdAt',
    sortKey = index,
    search,
  }: {
    startTime: number
    endTime: number
    reverse?: boolean
    index?: string
    sortKey?: string
    search?: (
      collection: Collection<RestaDB.Table.Order>,
    ) => Collection<RestaDB.Table.Order>
  }) {
    let collection = db.orders.where(index).between(startTime, endTime)
    type Coll = typeof collection
    if (reverse) {
      collection = collection.reverse()
    }
    if (search) {
      collection = search(collection as any) as Coll
    }
    return collection.sortBy(sortKey)
  },
  add(
    record: RestaDB.NewOrderRecord,
    createdAt?: RestaDB.OrderRecord['createdAt'],
  ) {
    if (!createdAt) {
      record.createdAt = dayjs().utc().valueOf()
    }
    return db.orders.add(record as RestaDB.OrderRecord)
  },
  set(
    id: RestaDB.ID,
    record: RestaDB.NewOrderRecord,
    updatedAt?: RestaDB.OrderRecord['updatedAt'],
  ) {
    if (!updatedAt) {
      record.updatedAt = dayjs().utc().valueOf()
    }
    return db.orders.update(id, record)
  },
  delete(id: RestaDB.ID) {
    return db.orders.delete(id)
  },
}
