import React from 'react'

import AppHeader from 'src/components/AppHeader'
import { Outlet } from 'react-router-dom'

import * as styles from './styles'

export const Home: React.FC<{}> = () => {
  return (
    <>
      <AppHeader />
      <main css={styles.mainCss}>
        <Outlet />
      </main>
    </>
  )
}

export default Home
