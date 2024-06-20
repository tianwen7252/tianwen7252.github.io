import React from 'react'

import AppHeader from '../AppHeader'
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
