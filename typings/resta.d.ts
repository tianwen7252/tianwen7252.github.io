/// <reference types="react" />
/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

export = Resta
export as namespace Resta

declare namespace Resta {
  type IObject = GuiFW.JsonObject
  type JsonObject = GuiFW.JsonObject

  namespace Keyboard {
    interface Input {
      data: InputItem[]
      total: number
    }
    interface InputItem {
      value?: string
      type?: string
      amount?: string
      operator?: '+' | '*'
    }
  }

  namespace Commodity {
    type Items =
      (typeof import('../src/constants/defaults/commondities').COMMODITIES)[0]['items']
    type Item = Items[0] & {
      showRelevancy?: boolean
      textIcon?: string
    }
    type RelevancyList = { name: string; textIcon?: string }[]
    type PriceMap = { [name: string]: RelevancyList }
    type CommodityMap = { [name: string]: number }
  }

  interface Order {
    data: Keyboard.InputItem[]
    total: number
    timestamp: number
    memo?: string[]
  }

  type OrderList = Order[]
}
