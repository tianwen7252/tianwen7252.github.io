import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import dayjs from 'dayjs'
import { OrdersDateHeader } from './orders-date-header'

// ─── Mocks ───────────────────────────────────────────────────────────────────

// Mock formatOrderDate to return predictable values
vi.mock('@/lib/format-order-date', () => ({
  formatOrderDate: vi.fn((date: import('dayjs').Dayjs) => ({
    formatted: `${date.year()}/${date.month() + 1}/${date.date()}`,
    label: '今天',
  })),
}))

// Mock lucide-react CalendarDays icon
vi.mock('lucide-react', () => ({
  CalendarDays: (props: Record<string, unknown>) => (
    <span data-testid="calendar-icon" {...props} />
  ),
}))

// Mock Popover components to render inline (avoid Radix Portal issues)
vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children, ...props }: { children: React.ReactNode; open?: boolean }) => (
    <div data-testid="popover-root" {...props}>
      {children}
    </div>
  ),
  PopoverTrigger: ({
    children,
    ...props
  }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="popover-trigger" {...props}>
      {children}
    </div>
  ),
  PopoverContent: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="popover-content" {...props}>
      {children}
    </div>
  ),
}))

// Mock Calendar to render a simple button that simulates date selection
vi.mock('@/components/ui/calendar', () => ({
  Calendar: ({
    onSelect,
    ...props
  }: {
    onSelect?: (date: Date | undefined) => void
    selected?: Date
    mode?: string
  }) => (
    <div data-testid="calendar" {...props}>
      <button
        data-testid="calendar-select-btn"
        onClick={() => onSelect?.(new Date('2026-03-20'))}
      >
        Select Date
      </button>
    </div>
  ),
}))

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('OrdersDateHeader', () => {
  const selectedDate = dayjs('2026-03-24')
  const onDateChange = vi.fn()

  const defaultProps = {
    selectedDate,
    onDateChange,
  }

  it('should render formatted date text with label', () => {
    render(<OrdersDateHeader {...defaultProps} />)
    // formatOrderDate returns "2026/3/24" and "今天"
    expect(screen.getByText(/2026\/3\/24/)).toBeTruthy()
    expect(screen.getByText(/今天/)).toBeTruthy()
  })

  it('should render calendar icon button', () => {
    render(<OrdersDateHeader {...defaultProps} />)
    expect(screen.getByTestId('calendar-icon')).toBeTruthy()
  })

  it('should have data-testid="orders-date-header"', () => {
    render(<OrdersDateHeader {...defaultProps} />)
    expect(screen.getByTestId('orders-date-header')).toBeTruthy()
  })

  it('should render popover with calendar inside', () => {
    render(<OrdersDateHeader {...defaultProps} />)
    expect(screen.getByTestId('popover-root')).toBeTruthy()
    expect(screen.getByTestId('calendar')).toBeTruthy()
  })

  it('should call onDateChange when a date is selected in the calendar', async () => {
    const handleDateChange = vi.fn()
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()

    render(
      <OrdersDateHeader selectedDate={selectedDate} onDateChange={handleDateChange} />,
    )

    await user.click(screen.getByTestId('calendar-select-btn'))
    expect(handleDateChange).toHaveBeenCalledOnce()
    // The argument should be a dayjs instance wrapping 2026-03-20
    const calledArg = handleDateChange.mock.calls[0]![0]
    expect(calledArg.format('YYYY-MM-DD')).toBe('2026-03-20')
  })
})
