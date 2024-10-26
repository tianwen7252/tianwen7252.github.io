import React from 'react'
import TestRenderer from 'react-test-renderer'

import Root from '../Root'

describe('Root tests', () => {
  test('snapshot', () => {
    const renderer = TestRenderer.create(<Root />)
    expect(renderer.toJSON()).toMatchSnapshot()
  })
})
