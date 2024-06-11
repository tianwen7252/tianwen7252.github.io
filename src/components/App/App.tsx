import React from 'react'
import { Global } from '@emotion/react'
import * as dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-tw'

import { rootCss } from 'src/styles/global'
import Home from '../Home'
import { AppContext, DefaultContextData } from './context'

dayjs.locale('zh-tw')
dayjs.extend(relativeTime)

export const App: React.FC<{}> = props => {
  return (
    <AppContext.Provider value={DefaultContextData}>
      <Global styles={[rootCss]} />
      <Home />
    </AppContext.Provider>
  )
}

export default App
