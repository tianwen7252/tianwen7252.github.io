import React from 'react'
import { ConfigProvider } from 'antd'
import { Global } from '@emotion/react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import 'src/libs/date'
import { rootCss, primaryBtnStyles } from 'src/styles/global'
import Root from '../Root'

import { AppContext, DefaultContextData } from './context'

// import { main } from 'src/scripts/generator'
// main('show-orders')

const router = createBrowserRouter([
  {
    path: '*',
    element: <Root />,
  },
])

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
        <RouterProvider router={router} />
      </ConfigProvider>
    </AppContext.Provider>
  )
}

export default App
