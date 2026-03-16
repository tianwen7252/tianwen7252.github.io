import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import Chart from '../Chart'

vi.mock('src/libs/dataCenter', () => ({
  db: {},
  init: vi.fn(),
  initDB: vi.fn(),
  DB_NAME: 'TianwenDB',
}))

vi.mock('src/libs/api', () => ({
  commondityTypes: { get: vi.fn().mockResolvedValue([]), set: vi.fn() },
  commondity: {
    get: vi.fn().mockResolvedValue([]),
    getMapData: vi.fn().mockResolvedValue({}),
    add: vi.fn(),
    clear: vi.fn(),
  },
  orderTypes: { get: vi.fn().mockResolvedValue([]) },
  resetCommonditType: vi.fn(),
  resetOrderType: vi.fn(),
}))

describe('Chart tests', () => {
  test('renders without crashing', () => {
    const { container } = render(<Chart type="bar" handle={null} dateMap={null} title="Test" />)
    expect(container).toBeDefined()
  })
})
