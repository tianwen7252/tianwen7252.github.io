import React from 'react'
import TestRenderer from 'react-test-renderer'

import Home from '../Home'

describe('Home tests', () => {
  test('snapshot', () => {
    const renderer = TestRenderer.create(<Home />)
    expect(renderer.toJSON()).toMatchSnapshot()
  })
})
