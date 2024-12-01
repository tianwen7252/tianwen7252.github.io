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
export const DefaultContextData = {
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

export const AppContext = createContext(DefaultContextData)
