import React from 'react'
import TestRenderer from 'react-test-renderer'

import Keyboard from '../Keyboard'

describe('Keyboard tests', () => {
  test('snapshot', () => {
    const renderer = TestRenderer.create(<Keyboard />)
    expect(renderer.toJSON()).toMatchSnapshot()
  })
})
