import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AppHeader from '../AppHeader'

vi.mock('src/libs/dataCenter', () => ({
  db: {},
  init: vi.fn(),
  initDB: vi.fn(),
  DB_NAME: 'TianwenDB',
}))

describe('AppHeader tests', () => {
  test('renders without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>,
    )
    expect(container).toBeDefined()
  })
})
