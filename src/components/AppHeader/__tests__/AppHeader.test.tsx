import React from 'react'
import TestRenderer from 'react-test-renderer'

import AppHeader from '../AppHeader'

describe('AppHeader tests', () => {
  test('snapshot', () => {
    const renderer = TestRenderer.create(<AppHeader />)
    expect(renderer.toJSON()).toMatchSnapshot()
  })
})
