import React from 'react'
import TestRenderer from 'react-test-renderer'

import App from '../App'

describe('App tests', () => {
  test('snapshot', () => {
    const renderer = TestRenderer.create(<App />)
    expect(renderer.toJSON()).toMatchSnapshot()
  })
})
