import React, { useCallback, useMemo, useState } from 'react'
import { ConfigProvider } from 'antd'
import { Global } from '@emotion/react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import 'src/libs/dayjs'
import { rootCss, antStyles } from 'src/styles/global'
import Root from '../Root'

import { AppContext, DefaultContextData } from './context'

const GAPI_TOKEN_STORAGE_KEY = 'gapi-token'

// import { main } from 'src/scripts/generator'
// main('show-orders')

const router = createBrowserRouter([
  {
    path: '*',
    element: <Root />,
  },
])

export const App: React.FC<{}> = () => {
  const [gAPIToken, setGAPITokenState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(GAPI_TOKEN_STORAGE_KEY)
    } catch {
      return null
    }
  })

  const setGAPIToken = useCallback((token: string | null) => {
    setGAPITokenState(token)
    try {
      if (token) {
        localStorage.setItem(GAPI_TOKEN_STORAGE_KEY, token)
      } else {
        localStorage.removeItem(GAPI_TOKEN_STORAGE_KEY)
      }
    } catch {
      // ignore persistence errors (e.g., storage disabled)
    }
  }, [])

  const contextValue = useMemo(
    () => ({
      ...DefaultContextData,
      gAPIToken,
      setGAPIToken,
    }),
    [gAPIToken, setGAPIToken],
  )

  // todo QuotaExceededError with react-error-boundary
  return (
    <AppContext.Provider value={contextValue}>
      <Global styles={[rootCss]} />
      <ConfigProvider
        theme={{
          components: antStyles,
        }}
      >
        <RouterProvider router={router} />
      </ConfigProvider>
    </AppContext.Provider>
  )
}

export default App
