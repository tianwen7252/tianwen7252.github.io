import fs from 'node:fs'
import * as prettier from 'prettier'

// const args = process.argv.slice(2)

import { COMMODITIES } from '../src/constants/defaults/commondities'

const filePath = 'src/constants/defaults/commondities.ts'

type Items_Type = (typeof COMMODITIES)[0]['items']
type Item_Type = Items_Type[0] & { showRelevancy?: boolean; textIcon?: string }
type RelevancyList = { name: string; textIcon?: string }[]
type CommodityMap = { [name: string]: RelevancyList }

export async function tidyCommondities(data = COMMODITIES) {
  const relevancies: Item_Type[] = []
  const commodities = {} as CommodityMap
  const tidy = (items: Items_Type, parentPrice?) => {
    items.forEach((item: Item_Type, index) => {
      const { name, menu, price = parentPrice, showRelevancy, textIcon } = item
      item.priority = index
      showRelevancy && relevancies.push(item)
      if (Array.isArray(menu)) {
        tidy(menu, price)
      } else {
        const list: RelevancyList = (commodities[price] =
          commodities[price] ?? [])
        if (!list.some(each => each.name === name)) {
          list.push({
            name,
            textIcon,
          })
        }
      }
    })
  }
  data.forEach(tab => {
    tidy(tab.items)
  })
  relevancies.forEach(item => {
    const { price } = item
    item.menu =
      commodities[price]?.map?.((data, index) => {
        return {
          ...data,
          price,
          priority: index,
        } as any
      }) ?? []
  })

  const prettierrc = fs.readFileSync('.prettierrc', 'utf-8')
  const content = await prettier.format(
    `
    export const COMMODITIES = ${JSON.stringify(data)}
  `,
    {
      parser: 'babel',
      ...JSON.parse(prettierrc),
    },
  )
  console.log('commodities', commodities)
  fs.writeFileSync(filePath, content)
  return data
}

tidyCommondities()
