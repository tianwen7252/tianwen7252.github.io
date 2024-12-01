import { forIn } from 'lodash'

export const DATE_FORMAT = 'YYYY/MM/DD dddd'
export const DATE_FORMAT_DATE = 'YYYY/MM/DD'
export const DATE_FORMAT_MONTH = 'YYYY/MM'
export const DATE_FORMAT_TIME = 'MM/DD HH:m:s A'
export const DATE_FORMAT_DATETIME_UI = 'YYYY/MM/DD HH:mm'
export const DATE_FORMAT_FOR_ANCHOR = 'MM-DD (dd)'

export const ORDER_LIST_PAGE_SIZE = 7

export function toCurrency(amount: number) {
  return (+amount).toLocaleString('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })
}

// without $
export function toCurrencyNumber(amount: number) {
  return toCurrency(amount).substring(1)
}

export function getHourFormat(hour, next = false) {
  const hh = hour - (hour > 12 ? 12 : 0)
  return `${hh} ${hour > 11 ? 'PM' : 'AM'}${next ? ` - ${getHourFormat(hour + 1)}` : ''}`
}

const userAgent = navigator.userAgent.toLowerCase()
export const isTablet =
  /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(
    userAgent,
  )

export function getCorrectAmount(amount: string) {
  const quailty = amount ? +amount : 1
  return quailty < 1 && quailty > 0 ? 1 : quailty
}

let priceMapGroupCache: Resta.Commodity.PriceMapGroup
let resMapGroupCache: Resta.Commodity.ResMapGroup
export function getCommoditiesInfo(
  data: Resta.Products.commonditiesMap = null,
  revise = false,
  getGroup = false,
) {
  const relevancies: Resta.Commodity.Item[] = []
  const priceMap = {} as Resta.Commodity.PriceMap
  const commodityMap = {} as Resta.Commodity.CommodityMap
  let priceMapGroup = {} as Resta.Commodity.PriceMapGroup
  let resMapGroup = {} as Resta.Commodity.ResMapGroup
  const tidy = (
    type: string,
    items: Resta.Commodity.Items,
    parentPrice?: number,
  ) => {
    items.forEach((item: Resta.Commodity.Item, index) => {
      const { name, menu, price = parentPrice, showRelevancy, textIcon } = item
      if (revise) {
        item.priority = index
        showRelevancy && relevancies.push(item)
      }
      commodityMap[name] = [price, type]
      if (Array.isArray(menu)) {
        tidy(type, menu, price)
      } else {
        const list: Resta.Commodity.RelevancyList = (priceMap[price] =
          priceMap[price] ?? [])
        if (!list.some(each => each.name === name)) {
          list.push({
            name,
            textIcon,
            type,
          })
        }
      }
    })
  }
  forIn(data, (items, typeID) => {
    // hard code temporarily
    let type = ''
    switch (typeID) {
      case '1':
        type = 'main-dish'
        break
      case '2':
        type = 'à-la-carte'
        break
      case '3':
        type = 'others'
        break
    }
    tidy(type, items)
  })
  if (revise) {
    relevancies.forEach(item => {
      const { price } = item
      item.menu =
        priceMap[price]?.map?.((data, index) => {
          return {
            ...data,
            price,
            priority: index,
          } as any
        }) ?? []
    })
  }
  if (getGroup) {
    // temporarily
    if (priceMapGroupCache && resMapGroupCache) {
      priceMapGroup = priceMapGroupCache
      resMapGroup = resMapGroupCache
    } else {
      Object.keys(priceMap).forEach(price => {
        priceMap[price].forEach(record => {
          const { type } = record
          const group = (priceMapGroup[type] =
            priceMapGroup[type] ?? ({} as Resta.Commodity.PriceMap))
          group[price] = group[price] ?? ([] as Resta.Commodity.RelevancyList)
          group[price].push(record)
          const resGroup = (resMapGroup[type] =
            resMapGroup[type] ?? ([] as Resta.Commodity.ResMapGroup))
          resGroup.push(record.name)
        })
      })
      // fix $15 to à-la-carte type temporarily
      priceMapGroup['à-la-carte']['15'] = [
        ...(priceMapGroup['à-la-carte']['15'] ?? []),
        ...priceMapGroup['main-dish']['15'],
      ] as Resta.Commodity.RelevancyList
      delete priceMapGroup['main-dish']['15']
      resMapGroup['à-la-carte'].push('加蛋')
      resMapGroup['à-la-carte'].push('加菜')
      resMapGroup['main-dish'] = resMapGroup['main-dish'].filter(
        name => name !== '加蛋' && name !== '加菜',
      )
      // temporarily
      priceMapGroupCache = priceMapGroup
      resMapGroupCache = resMapGroup
    }
  }
  return { data, priceMap, commodityMap, priceMapGroup, resMapGroup }
}
