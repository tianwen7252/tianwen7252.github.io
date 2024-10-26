import React from 'react'
import TestRenderer from 'react-test-renderer'

import Products from '../Products'

describe('Products tests', () => {
  test('snapshot', () => {
    const renderer = TestRenderer.create(<Products />)
    expect(renderer.toJSON()).toMatchSnapshot()
  })
})
