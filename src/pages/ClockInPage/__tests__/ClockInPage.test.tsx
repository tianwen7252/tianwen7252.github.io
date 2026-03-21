import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Mock the ClockIn component to isolate ClockInPage tests
vi.mock('src/components/Settings/Staff/ClockIn', () => ({
  default: () => <div data-testid="mock-clock-in">ClockIn Component</div>,
  ClockIn: () => <div data-testid="mock-clock-in">ClockIn Component</div>,
}))

import { ClockInPage } from '../ClockInPage'

describe('ClockInPage', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <ClockInPage />
      </MemoryRouter>,
    )

  test('renders a StickyHeader with title text "員工打卡"', () => {
    renderPage()
    expect(screen.getByText('員工打卡')).toBeInTheDocument()
  })

  test('renders the StickyHeader inside a <header> element', () => {
    const { container } = renderPage()
    const header = container.querySelector('header')
    expect(header).not.toBeNull()
    expect(header!.textContent).toContain('員工打卡')
  })

  test('renders the ClockIn component', () => {
    renderPage()
    expect(screen.getByTestId('mock-clock-in')).toBeInTheDocument()
  })
})
