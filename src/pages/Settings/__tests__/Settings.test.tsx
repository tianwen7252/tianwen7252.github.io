import React from 'react'
import TestRenderer from 'react-test-renderer'

import Settings from '../Settings'

describe('Settings tests', () => {
  test('snapshot', () => {
    const renderer = TestRenderer.create(<Settings />)
    expect(renderer.toJSON()).toMatchSnapshot()
  })
})
