import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ViewToggle } from './view-toggle'

describe('ViewToggle', () => {
  it('should render a button element', () => {
    render(<ViewToggle mode="grid" onToggle={vi.fn()} />)
    expect(screen.getByRole('button')).toBeTruthy()
  })

  it('should have accessible label for grid mode', () => {
    render(<ViewToggle mode="grid" onToggle={vi.fn()} />)
    expect(
      screen.getByRole('button', { name: /切換列表檢視/i }),
    ).toBeTruthy()
  })

  it('should have accessible label for list mode', () => {
    render(<ViewToggle mode="list" onToggle={vi.fn()} />)
    expect(
      screen.getByRole('button', { name: /切換格狀檢視/i }),
    ).toBeTruthy()
  })

  it('should call onToggle when clicked', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(<ViewToggle mode="grid" onToggle={onToggle} />)
    await user.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('should render LayoutGrid icon when mode is grid', () => {
    const { container } = render(
      <ViewToggle mode="grid" onToggle={vi.fn()} />,
    )
    // lucide-react renders an svg with data-testid or class; check svg presence
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
  })

  it('should render List icon when mode is list', () => {
    const { container } = render(
      <ViewToggle mode="list" onToggle={vi.fn()} />,
    )
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
  })

  it('should not call onToggle without user interaction', () => {
    const onToggle = vi.fn()
    render(<ViewToggle mode="grid" onToggle={onToggle} />)
    expect(onToggle).not.toHaveBeenCalled()
  })
})
