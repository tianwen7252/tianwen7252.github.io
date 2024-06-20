import React from 'react'

import AppHeader from '../AppHeader'
import { Outlet } from 'react-router-dom'

import * as styles from './styles'

export const Home: React.FC<{}> = () => {
  return (
    <>
      <AppHeader />
      <div css={styles.pageCss}>
        <Outlet />
      </div>
    </>
  )
}

export default Home
