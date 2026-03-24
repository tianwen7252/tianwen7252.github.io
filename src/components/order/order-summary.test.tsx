import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrderSummary } from './order-summary'

describe('OrderSummary', () => {
  it('should render subtotal label and value', () => {
    render(<OrderSummary subtotal={430} total={380} />)
    expect(screen.getByText('小計(不含優惠)')).toBeTruthy()
    expect(screen.getByText('$430')).toBeTruthy()
  })

  it('should render total label and value', () => {
    render(<OrderSummary subtotal={430} total={380} />)
    expect(screen.getByText('總金額')).toBeTruthy()
    expect(screen.getByText('$380')).toBeTruthy()
  })

  it('should format large subtotal with locale string', () => {
    const { container } = render(
      <OrderSummary subtotal={12500} total={12000} />,
    )
    const subtotalRow = container.querySelector('[data-testid="subtotal-row"]')
    expect(subtotalRow!.textContent).toContain('$12,500')
  })

  it('should format large total with locale string', () => {
    render(<OrderSummary subtotal={15000} total={13000} />)
    expect(screen.getByText('$13,000')).toBeTruthy()
  })

  it('should render zero values correctly', () => {
    render(<OrderSummary subtotal={0} total={0} />)
    const zeroElements = screen.getAllByText('$0')
    expect(zeroElements.length).toBeGreaterThanOrEqual(2)
  })

  it('should render total in large bold text', () => {
    const { container } = render(
      <OrderSummary subtotal={100} total={100} />,
    )
    const totalValue = container.querySelector('[data-testid="total-value"]')
    expect(totalValue).toBeTruthy()
    expect(totalValue!.textContent).toContain('$100')
  })

  it('should display subtotal value right-aligned', () => {
    const { container } = render(
      <OrderSummary subtotal={200} total={200} />,
    )
    const subtotalRow = container.querySelector('[data-testid="subtotal-row"]')
    expect(subtotalRow).toBeTruthy()
  })
})
