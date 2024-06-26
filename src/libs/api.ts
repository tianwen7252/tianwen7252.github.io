import { db } from 'src/libs/dataCenter'
import dayjs from 'dayjs'
import { trim } from 'lodash'

export const orders = {
  get({
    startTime,
    endTime,
    reverse = true,
    index = 'createdAt',
    sortKey = 'number',
    searchText = null,
    search,
  }: {
    startTime: number
    endTime: number
    reverse?: boolean
    index?: string
    sortKey?: string
    searchText?: string[]
    search?: Resta.API.Orders.SearchCallback
  }) {
    let collection = db.orders.where(index).between(startTime, endTime)
    type Coll = typeof collection
    if (reverse) {
      collection = collection.reverse()
    }
    if (searchText?.length) {
      collection = collection.filter(({ data, total, memo }) =>
        searchText.some(text => {
          text = trim(text)
          return (
            total === +text ||
            memo.some(tag => tag.includes(text)) ||
            data.some(item => {
              const { res, value } = item
              return res?.includes(text) || value === text
            })
          )
        }),
      )
    }
    if (search) {
      collection = search(collection as any) as Coll
    }
    return collection.sortBy(sortKey)
  },
  async add(
    record: RestaDB.NewOrderRecord,
    createdAt?: RestaDB.OrderRecord['createdAt'],
  ) {
    if (!createdAt) {
      createdAt = dayjs().utc().valueOf()
    }
    record.createdAt = createdAt
    const result = await db.orders.add(record as RestaDB.OrderRecord)
    await orders.updateDailyData('add', record)
    return result
  },
  async set(
    id: RestaDB.ID,
    record: RestaDB.NewOrderRecord,
    updatedAt?: RestaDB.OrderRecord['updatedAt'],
  ) {
    if (!updatedAt) {
      updatedAt = dayjs().utc().valueOf()
    }
    record.updatedAt = updatedAt
    const result = db.orders.update(id, record)
    await orders.updateDailyData('edit', record)
    return result
  },
  async delete(id: RestaDB.ID, record: RestaDB.NewOrderRecord) {
    const result = db.orders.delete(id)
    await orders.updateDailyData('delete', record)
    return result
  },
  async updateDailyData(
    action: Resta.Order.ActionType,
    record: RestaDB.NewOrderRecord,
  ) {
    const { createdAt } = record
    const day = dayjs(createdAt).startOf('day') // no need to use dayjs.utc here
    const date = day.format('YYYY/MM/DD')
    let id: number
    let dayTotal = 0
    const [dayData] = await dailyData.get({ date })
    if (dayData) {
      id = dayData.id
      dayTotal = dayData.total
    } else {
      id = await dailyData.add(date, 0, day.valueOf())
    }
    switch (action) {
      case 'add': {
        dailyData.set(id, dayTotal + record.total)
        break
      }
      default: {
        const dayEnd = day.endOf('day')
        const records = await orders.get({
          startTime: day.valueOf(),
          endTime: dayEnd.valueOf(),
          reverse: false,
        })
        const total = records.reduce((total, record) => {
          return total + record.total
        }, 0)
        dailyData.set(id, total)
      }
    }
  },
}

export const dailyData = {
  get({
    date, // YYYY/MM/DD
    startTime,
    endTime,
    reverse = true,
    index = 'createdAt',
    sortKey = index,
  }: {
    date: string
    startTime?: number
    endTime?: number
    reverse?: boolean
    index?: string
    sortKey?: string
  }) {
    let collection: ReturnType<typeof db.dailyData.where>
    if (date) {
      collection = db.dailyData.where('date').equals(date)
    } else {
      collection = db.dailyData.where(index).between(startTime, endTime)
    }
    if (reverse) {
      collection = collection.reverse()
    }
    return collection.sortBy(sortKey)
  },
  add(
    date: string,
    total: number,
    createdAt?: RestaDB.OrderRecord['createdAt'],
    editor = 'admin',
  ) {
    if (!createdAt) {
      createdAt = dayjs().utc().valueOf()
    }
    return db.dailyData.add({
      date,
      total,
      originalTotal: total,
      createdAt,
      updatedAt: createdAt,
      editor,
    })
  },
  set(
    id: RestaDB.ID,
    total: number,
    updatedAt?: RestaDB.OrderRecord['createdAt'],
    editor = 'admin',
  ) {
    if (!updatedAt) {
      updatedAt = dayjs().utc().valueOf()
    }
    return db.dailyData.update(id, {
      total,
      updatedAt,
      editor,
    })
  },
}
