import dayjs from 'dayjs'

import { DATE_FORMAT_TIME } from 'src/libs/common'
import { db } from 'src/libs/dataCenter'

export function main(target) {
  switch (target) {
    case 'orders':
      genOrders()
      break
    case 'fix':
      fixTimestamp()
      break
    case 'show-orders':
      showOrders()
      break
  }
}

async function genOrders(range = '1m') {}

async function fixTimestamp() {}

async function showOrders() {
  const orders = await db.orders.toArray()
  const list = orders.map(record => {
    return {
      ...record,
      date: dayjs.tz(record.createdAt).format(DATE_FORMAT_TIME),
      dateLocal: dayjs(record.createdAt).format(DATE_FORMAT_TIME),
    }
  })
  console.log(list)
}
