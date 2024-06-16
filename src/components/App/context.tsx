import { createContext } from 'react'

import { db } from 'src/libs/dataCenter'
import * as API from 'src/libs/api'
import { appEvent } from 'src/libs/appEvent'
import { isTablet, DATE_FORMAT, DATE_FORMAT_TIME } from 'src/libs/common'

export const DefaultContextData = {
  db,
  API,
  appEvent,
  isTablet,
  DATE_FORMAT,
  DATE_FORMAT_TIME,
}

export const AppContext = createContext(DefaultContextData)
