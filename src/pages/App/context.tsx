import { createContext } from 'react'

import { db } from 'src/libs/dataCenter'
import * as API from 'src/libs/api'
import { appEvent } from 'src/libs/appEvent'
import {
  isTablet,
  DATE_FORMAT,
  DATE_FORMAT_DATE,
  DATE_FORMAT_TIME,
  DATE_FORMAT_DATETIME_UI,
  getCommoditiesInfo,
} from 'src/libs/common'

let cacheCommoditiesInfo: ReturnType<typeof getCommoditiesInfo>
const baseContextData = {
  db,
  API,
  appEvent,
  isTablet,
  DATE_FORMAT,
  DATE_FORMAT_DATE,
  DATE_FORMAT_TIME,
  DATE_FORMAT_DATETIME_UI,
  async getAllCommoditiesInfo() {
    if (!cacheCommoditiesInfo) {
      const data = await API.commondity.getMapData()
      cacheCommoditiesInfo = getCommoditiesInfo(data, false, true)
    }
    return cacheCommoditiesInfo
  },
}

type BaseContextType = typeof baseContextData

export interface AppContextValue extends BaseContextType {
  gAPIToken: string | null
  setGAPIToken: (token: string | null) => void
}

export const DefaultContextData: AppContextValue = {
  ...baseContextData,
  gAPIToken: null,
  setGAPIToken: () => {},
}

export const AppContext = createContext<AppContextValue>(DefaultContextData)
