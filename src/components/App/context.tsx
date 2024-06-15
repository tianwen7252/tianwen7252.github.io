import { createContext } from 'react'

import { db } from 'src/libs/dataCenter'
import * as API from 'src/libs/api'
import { DATE_FORMAT, DATE_FORMAT_TIME } from 'src/libs/common'

const userAgent = navigator.userAgent.toLowerCase()
export const isTablet =
  /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(
    userAgent,
  )

export const DefaultContextData = {
  db,
  API,
  isTablet,
  DATE_FORMAT,
  DATE_FORMAT_TIME,
}

export const AppContext = createContext(DefaultContextData)
