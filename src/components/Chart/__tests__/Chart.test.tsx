import React from 'react'
import TestRenderer from 'react-test-renderer'

import Chart from '../Chart'

describe('Chart tests', () => {
  test('snapshot', () => {
    const renderer = TestRenderer.create(<Chart />)
    expect(renderer.toJSON()).toMatchSnapshot()
  })
})
