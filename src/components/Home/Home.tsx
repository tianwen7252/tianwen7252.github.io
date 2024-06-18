import React from 'react'

import AppHeader from '../AppHeader'
import { Outlet } from 'react-router-dom'

import './styles'

export const Home: React.FC<{}> = props => {
  return (
    <>
      <AppHeader />
      <Outlet />
    </>
  )
}

export default Home
