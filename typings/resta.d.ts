/// <reference types="react" />
/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

export = Resta
export as namespace Resta

declare namespace Resta {
  type IObject = {
    [key: string]: any
  }
  type JsonObject = IObject
  namespace Keyboard {
    type InputItem = RestaDB.OrderData
    type Data = RestaDB.OrderData[]
    interface Input {
      data: Data
      total: number
    }
    type Mode = 'both' | 'calculator' | 'commondity'
  }

  namespace Order {
    interface Props {
      record: Resta.OrderRecord
      number: number
      editable?: boolean
      onAction?(record: Resta.OrderRecord, action: ActionType): void
    }
    type ActionType = 'add' | 'edit' | 'delete'
  }

  namespace Commodity {
    type Items =
      (typeof import('../src/constants/defaults/commondities').COMMODITIES)[0]['items']
    type Item = ItemMenu & {
      showRelevancy?: boolean
      menu?: ItemMenu[]
      hideOnMode?: Mode | string
    }
    interface ItemMenu {
      name: string
      price: number
      priority: number
      textIcon?: string
      visible?: boolean
    }
    type RelevancyList = {
      name: string
      type: string
      textIcon?: string
    }[]
    type PriceMap = { [name: string]: RelevancyList }
    type CommodityMap = { [name: string]: [price: number, type: string] }
  }

  type OrderRecord = RestaDB.OrderRecord
  type OrderList = Order[]
  type OrderRecords = OrderList
}

declare global {
  type IObject = Resta.JsonObject
  type JsonObject = IObject

  namespace RestaDB {
    type ID = number
    namespace Table {
      interface Commondity {
        id: ID
        name: string
      }

      interface CommondityType {
        id: ID
        type: string
      }
      interface Order {
        id: ID
        number: number
        data: OrderData[]
        memo: string[]
        soups: number
        timestamp: number
        total: number
      }
    }

    type OrderRecord = Table.Order
    type NewOrderRecord = Partical<OrderRecord, 'id'>

    interface OrderData {
      value?: string
      res?: Commondity['name']
      type?: CommondityType['type']
      operator?: '+' | '*'
      amount?: string
    }
  }
}
