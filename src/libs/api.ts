import { db } from 'src/libs/dataCenter'
import dayjs from 'dayjs'

export const orders = {
  get(
    startTime: number,
    endTime: number,
    index = 'timestamp',
    sortKey = index,
  ) {
    return db.orders
      .where(index)
      .between(startTime, endTime)
      .reverse()
      .sortBy(sortKey)
  },
  add(record: RestaDB.NewOrderRecord) {
    return db.orders.add(record)
  },
  set(
    id: RestaDB.ID,
    record: RestaDB.NewOrderRecord,
    timestamp?: RestaDB.OrderRecord['timestamp'],
  ) {
    if (!timestamp) {
      record.timestamp = dayjs().valueOf()
    }
    return db.orders.update(id, record as RestaDB.NewOrderRecord)
  },
  delete(id: RestaDB.ID) {
    return db.orders.delete(id)
  },
}