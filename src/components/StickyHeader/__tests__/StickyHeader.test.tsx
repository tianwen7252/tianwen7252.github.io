import React from 'react'
import TestRenderer from 'react-test-renderer'

import StickyHeader from '../StickyHeader'

describe('StickyHeader tests', () => {
  test('snapshot', () => {
    const renderer = TestRenderer.create(<StickyHeader />)
    expect(renderer.toJSON()).toMatchSnapshot()
  })
})
