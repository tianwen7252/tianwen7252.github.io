import React from 'react'
import { Global } from '@emotion/react'

import { rootCss } from 'src/styles/global'
import Home from '../Home'
import { AppContext, DefaultContextData } from './context'

export const App: React.FC<{}> = props => {
  return (
    <AppContext.Provider value={DefaultContextData}>
      <Global styles={[rootCss]} />
      <Home />
    </AppContext.Provider>
  )
}

export default App
