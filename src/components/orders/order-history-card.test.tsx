import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Order } from '@/lib/schemas'
import { OrderHistoryCard } from './order-history-card'

// Mock SwipeActions to render children and expose action buttons directly
vi.mock('@/components/ui/swipe-actions', () => ({
  SwipeActions: ({
    actions,
    children,
  }: {
    actions: readonly {
      key: string
      icon: React.ReactNode
      color: string
      label?: string
      onClick: () => void
    }[]
    children: React.ReactNode
  }) => (
    <div data-testid="swipe-actions">
      {children}
      <div data-testid="swipe-action-buttons">
        {actions.map((action) => (
          <button
            key={action.key}
            data-testid={`swipe-action-${action.key}`}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  ),
}))

// Mock lucide-react icons to simple spans
vi.mock('lucide-react', () => ({
  Pencil: (props: Record<string, unknown>) => (
    <span data-testid="pencil-icon" {...props} />
  ),
  Trash2: (props: Record<string, unknown>) => (
    <span data-testid="trash2-icon" {...props} />
  ),
}))

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (key === 'orders.moreItems') return `+${opts?.count} more`
      return key
    },
  }),
}))

// ─── Factories ───────────────────────────────────────────────────────────────

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'test-1',
    number: 3,
    data: [
      { comID: 'c1', value: '雞腿飯', amount: '100' },
      { comID: 'c1', res: 'qty', operator: '*', amount: '2' },
      { comID: 'c2', value: '排骨飯', amount: '100' },
    ],
    memo: ['攤位', '外送'],
    soups: 3,
    total: 250,
    originalTotal: 300,
    editor: 'admin',
    createdAt: new Date('2026-03-24T12:45:00').getTime(),
    updatedAt: new Date('2026-03-24T12:45:00').getTime(),
    ...overrides,
  }
}

function makeManyItemsOrder(): Order {
  return makeOrder({
    data: [
      { comID: 'c1', value: '雞腿飯', amount: '100' },
      { comID: 'c2', value: '排骨飯', amount: '100' },
      { comID: 'c3', value: '魚排飯', amount: '120' },
      { comID: 'c4', value: '牛肉飯', amount: '150' },
      { comID: 'c5', value: '豬排飯', amount: '110' },
    ],
    total: 580,
    originalTotal: undefined,
  })
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('OrderHistoryCard', () => {
  const defaultProps = {
    order: makeOrder(),
    onDelete: vi.fn(),
  }

  it('should render order number', () => {
    render(<OrderHistoryCard {...defaultProps} />)
    expect(screen.getByText('#3')).toBeTruthy()
  })

  it('should render formatted time in AM/PM format', () => {
    render(<OrderHistoryCard {...defaultProps} />)
    expect(screen.getByText('12:45 PM')).toBeTruthy()
  })

  it('should render item summary from parsed order data', () => {
    render(<OrderHistoryCard {...defaultProps} />)
    // parseOrderItems produces: 雞腿飯 x2, 排骨飯 x1
    expect(screen.getByTestId('order-history-card')).toBeTruthy()
    const card = screen.getByTestId('order-history-card')
    expect(card.textContent).toContain('雞腿飯')
    expect(card.textContent).toContain('x2')
    expect(card.textContent).toContain('排骨飯')
  })

  it('should show "+N more" when more than 3 items exist', () => {
    const order = makeManyItemsOrder()
    render(<OrderHistoryCard order={order} onDelete={vi.fn()} />)
    // 5 items, show first 3, then "+2 more"
    expect(screen.getByText('+2 more')).toBeTruthy()
  })

  it('should not show "+N more" when 3 or fewer items', () => {
    // Default order has 2 items (雞腿飯 and 排骨飯)
    render(<OrderHistoryCard {...defaultProps} />)
    expect(screen.queryByText(/\+\d+ more/)).toBeNull()
  })

  it('should render memo tags as pills', () => {
    render(<OrderHistoryCard {...defaultProps} />)
    expect(screen.getByText('攤位')).toBeTruthy()
    expect(screen.getByText('外送')).toBeTruthy()
  })

  it('should not render memo section when memo is empty', () => {
    const order = makeOrder({ memo: [] })
    render(<OrderHistoryCard order={order} onDelete={vi.fn()} />)
    expect(screen.queryByTestId('memo-tags')).toBeNull()
  })

  it('should render total amount', () => {
    render(<OrderHistoryCard {...defaultProps} />)
    expect(screen.getByText('$250')).toBeTruthy()
  })

  it('should show original price with strikethrough when discounted', () => {
    render(<OrderHistoryCard {...defaultProps} />)
    const originalPrice = screen.getByText('$300')
    expect(originalPrice).toBeTruthy()
    expect(originalPrice.className).toContain('line-through')
  })

  it('should not show original price when not discounted', () => {
    const order = makeOrder({ originalTotal: undefined })
    render(<OrderHistoryCard order={order} onDelete={vi.fn()} />)
    // Only $250 (total) should be present, no strikethrough price
    const card = screen.getByTestId('order-history-card')
    const lineThroughElements = card.querySelectorAll('.line-through')
    expect(lineThroughElements.length).toBe(0)
  })

  it('should not show original price when originalTotal equals total', () => {
    const order = makeOrder({ originalTotal: 250, total: 250 })
    render(<OrderHistoryCard order={order} onDelete={vi.fn()} />)
    const card = screen.getByTestId('order-history-card')
    const lineThroughElements = card.querySelectorAll('.line-through')
    expect(lineThroughElements.length).toBe(0)
  })

  it('should always show both edit and delete swipe actions', () => {
    render(<OrderHistoryCard {...defaultProps} />)
    expect(screen.getByTestId('swipe-action-edit')).toBeTruthy()
    expect(screen.getByTestId('swipe-action-delete')).toBeTruthy()
  })

  it('should call onDelete when delete swipe action is triggered', async () => {
    const onDelete = vi.fn()
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    render(<OrderHistoryCard order={makeOrder()} onDelete={onDelete} />)
    await user.click(screen.getByTestId('swipe-action-delete'))
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('should call onEdit when edit swipe action is triggered', async () => {
    const onEdit = vi.fn()
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    render(
      <OrderHistoryCard order={makeOrder()} onDelete={vi.fn()} onEdit={onEdit} />,
    )
    await user.click(screen.getByTestId('swipe-action-edit'))
    expect(onEdit).toHaveBeenCalledOnce()
  })

  it('should have data-testid="order-history-card"', () => {
    render(<OrderHistoryCard {...defaultProps} />)
    expect(screen.getByTestId('order-history-card')).toBeTruthy()
  })
})
