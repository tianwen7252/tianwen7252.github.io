import React from 'react'
import TestRenderer from 'react-test-renderer'

import Backup from '../Backup'

describe('Backup tests', () => {
  test('snapshot', () => {
    const renderer = TestRenderer.create(<Backup />)
    expect(renderer.toJSON()).toMatchSnapshot()
  })
})
