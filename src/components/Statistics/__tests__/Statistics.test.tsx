import React from 'react'
import TestRenderer from 'react-test-renderer'

import Statistics from '../Statistics'

describe('Statistics tests', () => {
  test('snapshot', () => {
    const renderer = TestRenderer.create(<Statistics />)
    expect(renderer.toJSON()).toMatchSnapshot()
  })
})
