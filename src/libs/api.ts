import { db } from 'src/libs/dataCenter'
import dayjs from 'dayjs'

export const orders = {
  get({
    startTime,
    endTime,
    reverse = true,
    index = 'createdAt',
    sortKey = 'number',
    searchText = null,
    offset = 0,
    limit = 0,
    search,
  }: {
    startTime: number
    endTime: number
    reverse?: boolean
    index?: string
    sortKey?: string
    searchText?: string[]
    offset?: number
    limit?: number
    search?: Resta.APIFn.Orders.SearchCallback
  }) {
    let collection = db.orders.where(index).between(startTime, endTime)
    type Coll = typeof collection
    if (reverse) {
      collection = collection.reverse()
    }
    if (searchText?.length) {
      collection = collection.filter(({ data, total, memo }) =>
        searchText.some(text => {
          text = text.trim()
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
    if (offset) {
      collection = collection.offset(offset)
    }
    if (limit) {
      collection = collection.limit(limit)
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
    // using transaction to avoid creating multiple daily data
    const result = await db.transaction(
      'rw',
      [db.orders, db.dailyData],
      async () => {
        const result = await db.orders.add(record as RestaDB.OrderRecord)
        await orders.updateDailyData('add', record)
        return result
      },
    )
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
    date?: string
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
  set(id: RestaDB.ID, total: number, editor = 'admin') {
    return db.dailyData.update(id, {
      total,
      originalTotal: total,
      editor,
    })
  },
  revise(
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

export const statistics = {
  async get(startTime: number, endTime: number) {
    const records = await orders.get({
      startTime,
      endTime,
      reverse: false,
    })
    const dailyDataInfo = await dailyData.get({
      startTime,
      endTime,
      reverse: false,
    })
    return { records, dailyDataInfo }
  },
}

export const commondityTypes = {
  async get() {
    return db.commondityType.toArray()
  },
  async add(record: Omit<RestaDB.Table.CommondityType, 'id'>) {
    record.createdAt = dayjs().utc().valueOf()
    return db.commondityType.add(record)
  },
  async set(
    id: number,
    record: Omit<RestaDB.Table.CommondityType, 'type' | 'id' | 'createdAt'>,
  ) {
    return db.commondityType.update(id, record)
  },
  async clear() {
    return db.commondityType.clear()
  },
}

export const commondity = {
  async get(onMarket: RestaDB.Table.Commondity['onMarket'] = '1') {
    if (onMarket) {
      return (
        db.commondity
          .where('onMarket')
          .equals(onMarket)
          //.sortBy('priority')
          .toArray()
      )
    }
    return db.commondity.toArray()
  },
  async getMapData(onMarket?: RestaDB.Table.Commondity['onMarket']) {
    const data = await commondity.get(onMarket)
    const map: Resta.Products.commonditiesMap = {}
    data?.forEach(item => {
      const { id, typeID, priority, onMarket } = item
      map[typeID] = map[typeID] ?? []
      if (onMarket === '1') {
        map[typeID].push({
          key: `${id}-${priority}`,
          ...item,
        })
      }
    })
    return map
  },
  async add(record: Omit<RestaDB.Table.Commondity, 'id'>, editor = 'admin') {
    return db.commondity.add({
      ...record,
      createdAt: dayjs().utc().valueOf(),
      editor,
    })
  },
  async set(
    id: number,
    record: Omit<RestaDB.Table.Commondity, 'type' | 'id' | 'createdAt'>,
  ) {
    record.updatedAt = dayjs().utc().valueOf()
    return db.commondity.update(id, record)
  },
  async clear() {
    return db.commondity.clear()
  },
}

export const orderTypes = {
  async get() {
    return db.orderTypes.toArray()
  },
  async add(record: Omit<RestaDB.Table.OrderType, 'id'>, editor = 'admin') {
    return db.orderTypes.add({
      ...record,
      createdAt: dayjs().utc().valueOf(),
      editor,
    })
  },
  async set(id: number, record: RestaDB.Table.OrderType) {
    record.updatedAt = dayjs().utc().valueOf()
    return db.orderTypes.update(id, record)
  },
  async delete(id: number) {
    return db.orderTypes.delete(id)
  },
  async clear() {
    return db.orderTypes.clear()
  },
}
