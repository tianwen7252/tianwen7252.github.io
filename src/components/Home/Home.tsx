import React from 'react'

import AppHeader from '../AppHeader'
import Keyboard from '../Keyboard'

import './styles'

export const Home: React.FC<{}> = props => {
  return (
    <>
      <AppHeader />
      <Keyboard />
    </>
  )
}

export default Home
