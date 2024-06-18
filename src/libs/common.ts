import { COMMODITIES } from 'src/constants/defaults/commondities'

export const DATE_FORMAT = 'YYYY/MM/DD dddd'
export const DATE_FORMAT_TIME = 'YYYY/MM/DD HH:m:s A'

export function toCurrency(amount: number) {
  return amount.toLocaleString('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })
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

export function getCommoditiesInfo(data = COMMODITIES, revise = false) {
  const relevancies: Resta.Commodity.Item[] = []
  const priceMap = {} as Resta.Commodity.PriceMap
  const commodityMap = {} as Resta.Commodity.CommodityMap
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
  data.forEach(({ type, items }) => {
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
  // console.log('priceMap', priceMap)
  return { data, priceMap, commodityMap }
}
