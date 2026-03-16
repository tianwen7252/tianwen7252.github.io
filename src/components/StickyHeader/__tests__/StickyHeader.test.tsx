import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import StickyHeader from '../StickyHeader'

vi.mock('src/libs/dataCenter', () => ({
  db: {},
  init: vi.fn(),
  initDB: vi.fn(),
  DB_NAME: 'TianwenDB',
}))

describe('StickyHeader tests', () => {
  test('renders without crashing', () => {
    const { container } = render(<StickyHeader />)
    expect(container).toBeDefined()
  })
})
