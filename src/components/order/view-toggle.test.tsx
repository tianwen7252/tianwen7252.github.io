import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ViewToggle } from './view-toggle'

describe('ViewToggle (Calculator button)', () => {
  it('should render a button element', () => {
    render(<ViewToggle mode="grid" onToggle={vi.fn()} />)
    expect(screen.getByRole('button')).toBeTruthy()
  })

  it('should have accessible label', () => {
    render(<ViewToggle mode="grid" onToggle={vi.fn()} />)
    expect(screen.getByRole('button', { name: /計算機/i })).toBeTruthy()
  })

  it('should call onToggle when clicked', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(<ViewToggle mode="grid" onToggle={onToggle} />)
    await user.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('should render calculator svg icon', () => {
    const { container } = render(
      <ViewToggle mode="grid" onToggle={vi.fn()} />,
    )
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('should not call onToggle without user interaction', () => {
    const onToggle = vi.fn()
    render(<ViewToggle mode="grid" onToggle={onToggle} />)
    expect(onToggle).not.toHaveBeenCalled()
  })
})
