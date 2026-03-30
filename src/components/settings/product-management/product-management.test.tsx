/**
 * Tests for ProductManagement page component.
 * Verifies all 4 sections are rendered.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductManagement } from './product-management'

// Mock all child sections to isolate ProductManagement rendering
vi.mock('./commodity-type-section', () => ({
  CommodityTypeSection: () => (
    <div data-testid="commodity-type-section">CommodityTypeSection</div>
  ),
}))

vi.mock('./commodity-section', () => ({
  CommoditySection: () => (
    <div data-testid="commodity-section">CommoditySection</div>
  ),
}))

vi.mock('./order-type-section', () => ({
  OrderTypeSection: () => (
    <div data-testid="order-type-section">OrderTypeSection</div>
  ),
}))

vi.mock('./reset-section', () => ({
  ResetSection: () => <div data-testid="reset-section">ResetSection</div>,
}))

describe('ProductManagement', () => {
  it('should render CommodityTypeSection', () => {
    render(<ProductManagement />)
    expect(screen.getByTestId('commodity-type-section')).toBeTruthy()
  })

  it('should render CommoditySection', () => {
    render(<ProductManagement />)
    expect(screen.getByTestId('commodity-section')).toBeTruthy()
  })

  it('should render OrderTypeSection', () => {
    render(<ProductManagement />)
    expect(screen.getByTestId('order-type-section')).toBeTruthy()
  })

  it('should render ResetSection', () => {
    render(<ProductManagement />)
    expect(screen.getByTestId('reset-section')).toBeTruthy()
  })

  it('should render all 4 sections together', () => {
    render(<ProductManagement />)
    expect(screen.getByTestId('commodity-type-section')).toBeTruthy()
    expect(screen.getByTestId('commodity-section')).toBeTruthy()
    expect(screen.getByTestId('order-type-section')).toBeTruthy()
    expect(screen.getByTestId('reset-section')).toBeTruthy()
  })
})
