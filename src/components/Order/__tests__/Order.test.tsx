import React from 'react'
import TestRenderer from 'react-test-renderer'

import Order from '../Order'

describe('Order tests', () => {
  test('snapshot', () => {
    const renderer = TestRenderer.create(<Order />)
    expect(renderer.toJSON()).toMatchSnapshot()
  })
})
