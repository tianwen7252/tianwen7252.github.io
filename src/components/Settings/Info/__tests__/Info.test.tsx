import React from 'react'
import TestRenderer from 'react-test-renderer'

import Info from '../Info'

describe('Info tests', () => {
  test('snapshot', () => {
    const renderer = TestRenderer.create(<Info />)
    expect(renderer.toJSON()).toMatchSnapshot()
  })
})
