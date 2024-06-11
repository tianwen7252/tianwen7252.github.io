import React from 'react'
import TestRenderer from 'react-test-renderer'

import OrderList from '../OrderList'

describe('OrderList tests', () => {
  test('snapshot', () => {
    const renderer = TestRenderer.create(<OrderList />)
    expect(renderer.toJSON()).toMatchSnapshot()
  })
})
