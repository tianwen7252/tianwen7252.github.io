import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import Info from '../Info'

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
  orders: { get: vi.fn().mockResolvedValue([]) },
  dailyData: { get: vi.fn().mockResolvedValue([]) },
  resetCommonditType: vi.fn(),
  resetOrderType: vi.fn(),
}))

// Mock ky HTTP client used in Info component
vi.mock('ky', () => ({
  default: {
    get: vi.fn().mockReturnValue({
      json: vi.fn().mockResolvedValue({ tag_name: 'v1.0.0' }),
    }),
  },
}))

describe('Info tests', () => {
  test('renders without crashing', () => {
    const { container } = render(<Info />)
    expect(container).toBeDefined()
  })
})
