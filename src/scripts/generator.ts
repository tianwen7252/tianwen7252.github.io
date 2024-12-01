import dayjs from 'dayjs'
import type { ManipulateType } from 'dayjs'
import { cloneDeep } from 'lodash'

import {
  DATE_FORMAT_TIME,
  DATE_FORMAT_DATE,
  getCommoditiesInfo,
} from 'src/libs/common'
import { ORDER_TYPES } from 'src/constants/defaults/orderTypes'
import { db } from 'src/libs/dataCenter'
import * as API from 'src/libs/api'

export function generate(target, ...args) {
  switch (target) {
    case 'orders':
      genOrders.apply(null, args)
      break
    case 'fix':
      fixTimestamp()
      break
    case 'show-orders':
      showOrders()
      break
  }
}

const commondityTypes = ['main-dish', 'à-la-carte', 'others']
const randomHoursAM = [10, 13]
const randomHoursPM = [16, 19] // 19:00 ~ 20:00 is the last selling time
const randomMinutes = [0, 59]
const randomSeconds = [0, 59]
const randomCommondityType = [80, 10, 10] // 80%, 10%, 10% (main, single, others)
const randomOrdersAmountOfPrePerson = [1, 10]
const randomOrdersAmountOfPreOrder = [10, 50]
const randomOrderType = [90, 10] // 90% general customer, 10% commercial customer
const randomMemoProb = [30, 70] // 30% will have memo, 70% no memo
// '飯少', '飯多', '不要飯', '不要湯', '加滷汁', '電話自取', '外送訂單', '優惠價', '免費'
// '外送訂單' is another condition depending on randomOrderType
const randomMemoTypes = [20, 10, 10, 10, 10, 3, 25, 1, 1] // 10%..... 5%
const randomOneDayOrders = [
  [90, 125],
  [180, 250],
] // [[morning min, max], [afternoon min, max]]

// copied from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min)
  const maxFloored = Math.floor(max)
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled) // The maximum is inclusive and the minimum is inclusive
}

function getProbability(probArray: number[]) {
  const randomNumber = getRandomInt(1, 100)
  const { length } = probArray
  let start = 0
  let complement = 0 // for each probability if total is lower 100
  const total = probArray.reduce((total, each) => {
    return total + each
  }, 0)
  if (start > 100) {
    console.log('Probability is over 100%', probArray)
  }
  complement = Math.floor((100 - total) / length)
  const result = probArray.findIndex(prob => {
    const min = start + 1
    const max = prob + start + complement
    start = max
    // console.log('Probability:', min, max)
    return randomNumber >= min && randomNumber <= max
  })
  // console.log('Probability result', randomNumber, result, complement)
  if (result === -1) {
    // console.log('Probability is the new random one because of not found')
    return getRandomInt(0, length - 1)
  }
  return result
}

function getRandomItem(target: Resta.JsonObject | Array<any>, key = '') {
  let value
  if (Array.isArray(target)) {
    value =
      target.length === 1
        ? target[0]
        : target[getRandomInt(0, target.length - 1)]
  } else {
    const keys = Object.keys(target)
    const randomNumber = getRandomInt(0, keys.length - 1)
    key = keys[randomNumber]
    value = target[key]
    if (Array.isArray(value)) {
      return getRandomItem(value, key)
    }
  }
  return [value, key]
}

async function genOrders(range = '1Q', clear = false) {
  const [dayAmount, unit] = range.split('')
  const today = dayjs.tz().startOf('day').hour(20) // 8 PM is the last selling time
  const date = today.format(DATE_FORMAT_DATE)
  const pastDay = today.add(-dayAmount, unit as ManipulateType)
  const betweenDaysCount = today.diff(pastDay, 'd')
  const betweenDays = [...Array(betweenDaysCount).keys()]
  console.log(
    'Generating orders...\r\n',
    `[range]: ${range}\r\n`,
    `[today]: ${today.format(DATE_FORMAT_TIME)}\r\n`,
    `[past day]: ${pastDay.format(DATE_FORMAT_TIME)}\r\n`,
    `[betweenDaysCount]: ${betweenDaysCount}\r\n`,
  )
  if (clear) {
    await db.orders.clear()
    await db.dailyData.clear()
  }
  const { priceMapGroup } = getCommoditiesInfo(undefined, false, true)
  const dateMap = {} as Resta.IObject
  for (const index of betweenDays) {
    const day = today.add(-index - 1, 'd')
    const [startTime, endTime] = [
      day.startOf('day').valueOf(),
      day.endOf('day').valueOf(),
    ]
    const reords = await API.orders.get({ startTime, endTime })
    if (!reords?.length) {
      dateMap[date] = {
        AM: {
          records: [],
          count: 0,
          total: 0,
        },
        PM: {
          records: [],
          count: 0,
          total: 0,
        },
      }
      const genMemo = (isCustomer: boolean) => {
        const prob = getProbability(randomMemoProb)
        if (prob === 0) {
          return []
        }
        const random = getRandomInt(1, randomMemoTypes.length)
        const set = new Set()
        const memo = [...Array(random).keys()]
        memo.forEach(() => {
          const prob = getProbability(randomMemoTypes)
          set.add(ORDER_TYPES[prob].name)
        })
        set.delete('外送')
        if (isCustomer) {
          set.add('外送')
        }
        return Array.from(set)
      }
      const [AMrandom, PMrandom] = cloneDeep(randomOneDayOrders)
      const gen = (timeType: 'AM' | 'PM') => {
        const [ordersRange, randomHours] =
          timeType === 'AM'
            ? [AMrandom, randomHoursAM]
            : [PMrandom, randomHoursPM]
        let countLeft = getRandomInt.apply(null, ordersRange)
        let number = 0
        while (countLeft >= 0) {
          ++number
          const customerTypeProb = getProbability(randomOrderType)
          const isCustomer = customerTypeProb === 1
          const amount = getRandomInt.apply(
            null,
            isCustomer
              ? randomOrdersAmountOfPreOrder
              : randomOrdersAmountOfPrePerson,
          )
          const thisDay = day
            .hour(getRandomInt(randomHours[0], randomHours[1]))
            .minute(getRandomInt(randomMinutes[0], randomMinutes[1]))
            .second(getRandomInt(randomSeconds[0], randomSeconds[1]))

          const createdAt = thisDay.valueOf()
          const newRecord = {
            data: [],
            number,
            memo: genMemo(isCustomer),
            createdAt,
            total: 0,
          } as RestaDB.OrderRecord
          const orders = [...Array(amount).keys()]
          orders.forEach((each, index) => {
            const commProb = getProbability(randomCommondityType)
            const commType = commondityTypes[commProb]
            const commItems = priceMapGroup[commType]
            const [comm, commonKey] = getRandomItem(commItems)
            const price = +commonKey
            const { name } = comm
            newRecord.data.push({
              res: name,
              type: commType,
              value: '' + price,
            })
            newRecord.total += price
            // if not last one
            if (index < amount - 1) {
              newRecord.data.push({
                operator: '+',
                value: '',
              })
            }
          })
          // console.log('newRecord', timeType, orders, newRecord, amount)
          countLeft -= amount
          if (newRecord.memo.includes('免費')) {
            newRecord.total = 0
          }
          const map = dateMap[date][timeType]
          map.records.push(newRecord)
          map.count += amount
          map.total += newRecord.total
          // write this record to db
          API.orders.add(newRecord, createdAt)
        }
      }
      gen('AM')
      gen('PM')
    }
    console.log(
      'time',
      day.format(DATE_FORMAT_TIME),
      dateMap[date],
      'generated!\r\n',
    )
  }
}

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
