/// <reference types="react" />
/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
import type { Collection } from 'dexie'

export = Resta
export as namespace Resta

declare namespace Resta {
  type IObject = {
    [key: string]: any
  }
  type JsonObject = IObject
  type NotificationType = 'success' | 'info' | 'warning' | 'error'
  type AppEventObject<T extends JsonObject> = Event & {
    detail?: T
  }
  interface AppEventListener {
    (evt: AppEventObject): void
  }

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
      onAction?(
        record: Resta.OrderRecord,
        action: ActionType,
        callOrderAPI: Props['callOrderAPI'],
      ): void
      callOrderAPI?(
        record: RestaDB.OrderRecord | RestaDB.NewOrderRecord,
        action: Resta.Order.ActionType,
        createdAt?: RestaDB.OrderRecord['createdAt'],
      )
      onCancelEdit?(): void
    }
    type ActionType = 'add' | 'edit' | 'delete'
  }

  namespace OrderList {
    type Period = {
      title: string
      id: string
      createdAt: number
      elements: JSX.Element[]
    }[]

    type HandleRecords = (
      records: RestaDB.Table.Order[],
    ) => RestaDB.Table.Order[]
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

  namespace API {
    namespace Orders {
      type SearchCallback = (
        collection: Collection<RestaDB.Table.Order>,
      ) => Collection<RestaDB.Table.Order>
    }
  }
}

declare global {
  type IObject = Resta.JsonObject
  type JsonObject = IObject

  namespace RestaDB {
    type ID = number
    type UUID = string
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
        uuid: uuid
        number: number
        data: OrderData[]
        memo: string[]
        soups: number
        createdAt: number
        updatedAt: number
        total: number
      }
    }

    type OrderRecord = Table.Order
    //  type NewOrderRecord = Omit<OrderRecord, 'id' | 'createdAt' | 'updatedAt'>
    type NewOrderRecord = Partial<OrderRecord>

    interface OrderData {
      value?: string
      res?: Commondity['name']
      type?: CommondityType['type']
      operator?: '+' | '*'
      amount?: string
    }
  }
}
