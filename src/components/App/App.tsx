import React from 'react'
import { ConfigProvider } from 'antd'
import { Global } from '@emotion/react'
import * as dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-tw'

import { rootCss, primaryBtnStyles } from 'src/styles/global'
import Home from '../Home'
import { AppContext, DefaultContextData } from './context'

dayjs.locale('zh-tw')
dayjs.extend(relativeTime)

export const App: React.FC<{}> = () => {
  // todo QuotaExceededError with react-error-boundary
  return (
    <AppContext.Provider value={DefaultContextData}>
      <Global styles={[rootCss]} />
      <ConfigProvider
        theme={{
          components: {
            Button: primaryBtnStyles,
          },
        }}
      >
        <Home />
      </ConfigProvider>
    </AppContext.Provider>
  )
}

export default App
