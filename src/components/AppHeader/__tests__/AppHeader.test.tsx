import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AppHeader from '../AppHeader'

vi.mock('src/libs/dataCenter', () => ({
  db: {},
  init: vi.fn(),
  initDB: vi.fn(),
  DB_NAME: 'TianwenDB',
}))

// Mock useNavigate to capture navigation calls
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  )
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('AppHeader tests', () => {
  test('renders without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>,
    )
    expect(container).toBeDefined()
  })

  test('has a clock-in FloatButton that navigates to /clock-in on click', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>,
    )
    // Open the FloatButton.Group by clicking the trigger button
    const triggerBtn = baseElement.querySelector(
      '.ant-float-btn-group-trigger',
    )
    expect(triggerBtn).not.toBeNull()
    fireEvent.click(triggerBtn!)

    // After opening, find all float buttons and check for clock icon (ClockCircleOutlined)
    const doc = baseElement.ownerDocument
    const clockIcon = doc.querySelector('[aria-label="clock-circle"]')
    expect(clockIcon).not.toBeNull()

    // Click the clock-in button and verify navigation
    const clockInButton = clockIcon!.closest('button')
    expect(clockInButton).not.toBeNull()
    fireEvent.click(clockInButton!)
    expect(mockNavigate).toHaveBeenCalledWith('/clock-in')
  })

  test('clock-in FloatButton icon is positioned between order and order-list icons', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>,
    )
    // Open the FloatButton.Group
    const triggerBtn = baseElement.querySelector(
      '.ant-float-btn-group-trigger',
    )
    fireEvent.click(triggerBtn!)

    // Find all icons by their aria-label to determine order
    const doc = baseElement.ownerDocument
    const allIcons = doc.querySelectorAll('[role="img"][aria-label]')
    const iconLabels = Array.from(allIcons).map(icon =>
      icon.getAttribute('aria-label'),
    )

    const orderIconIndex = iconLabels.indexOf('form')
    const clockInIconIndex = iconLabels.indexOf('clock-circle')
    const orderListIconIndex = iconLabels.indexOf('unordered-list')

    expect(orderIconIndex).toBeGreaterThanOrEqual(0)
    expect(clockInIconIndex).toBeGreaterThanOrEqual(0)
    expect(orderListIconIndex).toBeGreaterThanOrEqual(0)

    // clock-in icon should come after order and before order-list
    expect(clockInIconIndex).toBeGreaterThan(orderIconIndex)
    expect(clockInIconIndex).toBeLessThan(orderListIconIndex)
  })
})
