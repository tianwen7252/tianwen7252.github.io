/// <reference types="react" />
/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
import type { Collection } from 'dexie'
import type { ChartConfiguration } from 'chart.js'

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
  interface AppEventListener<T = AppEventObject> {
    (event: T): void
  }
  namespace AppEvent {
    namespace KEYBOARD_ON_ACTION {
      interface Detail {
        record: Resta.OrderRecord
        action: Resta.Order.ActionType
        callOrderAPI: Order.Props['callOrderAPI']
      }
    }
  }

  namespace Keyboard {
    type InputItem = RestaDB.OrderData
    type Data = RestaDB.OrderData[]
    interface Input {
      data: Data
      total: number
    }
    type Mode = 'both' | 'calculator' | 'commondity'

    interface Props {
      callOrderAPI: Order.Props['callOrderAPI']
      mode?: Mode // keyboard mode
      editMode?: boolean
      record?: Resta.OrderRecord // for edit
      lastRecordNumber?: number // for add mode
      drawerMode?: boolean
      submitCallback?: (type?: Resta.Order.ActionType) => void
    }
  }

  namespace Order {
    interface Props {
      record: Resta.OrderRecord
      number: number
      editable?: boolean
      callOrderAPI?(
        record: RestaDB.OrderRecord | RestaDB.NewOrderRecord,
        action: Resta.Order.ActionType,
        createdAt?: RestaDB.OrderRecord['createdAt'],
      )
    }
    type ActionType = 'add' | 'edit' | 'delete'
  }

  namespace OrderList {
    type PeriodMap = {
      [date: string]: {
        periods: Period[]
        soldCount: number
        datetime: number
        dateWithWeek: string
        recordCount: number
      }
    }

    type Period = {
      title: string
      id: string
      createdAt: number
      elements: JSX.Element[]
      color: string
      total: number
    }

    type HandleRecords = (
      records: RestaDB.Table.Order[],
    ) => RestaDB.Table.Order[]
  }

  namespace Statistics {
    type StatAPIGet = {
      records: RestaDB.Table.Order[]
      dailyDataInfo: RestaDB.Table.DailyData[]
    }
  }

  namespace Chart {
    type DateMap = {
      [date: string]: {
        records: RestaDB.Table.OrderRecord[]
        dailyData: RestaDB.Table.DailyData
      }
    }
    type DateType = 'd' | 'w' | 'm' | 'q' | 'y'
    interface Props {
      dateMap: Resta.Statistics.DataMap
      dateType: DateType
      title: string
      type: 'bar' | 'line' | 'bubble' | 'doughnut' | 'pie'
      allowedDateType?: string | null
      handle(
        dateMap?: Resta.Statistics.DataMap,
        selectedDateType?: DateType,
      ): ChartConfig
    }
    interface ChartConfig {
      options: ChartConfiguration['options']
      data: ChartConfiguration['data']
    }
    interface GroupData {
      [group: string]: number
    }
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
    type PriceMapGroup = {
      [name: 'main-dish' | 'à-la-carte' | 'others']: PriceMap
    }
    type ResMapGroup = {
      [name: 'main-dish' | 'à-la-carte' | 'others']: string[]
    }
  }

  type OrderRecord = RestaDB.OrderRecord
  type OrderList = RestaDB.Table.Order[]
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
      interface DailyData {
        id: ID
        date: string
        total: number
        originalTotal: number
        // morningTotal: number
        // afternoonTotal: number
        // ordersCount: number
        createdAt: number
        updatedAt: number
        editor: string
      }
    }

    interface OrderRecord extends Table.Order {
      $isAM?: boolean
    }
    //  type NewOrderRecord = Omit<OrderRecord, 'id' | 'createdAt' | 'updatedAt'>
    type NewOrderRecord = Partial<OrderRecord>

    interface OrderData {
      value?: string
      res?: Table.Commondity['name']
      type?: Table.CommondityType['type']
      operator?: '+' | '*'
      amount?: string
    }
  }
}
