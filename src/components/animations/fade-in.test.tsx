import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FadeIn } from './fade-in'

describe('FadeIn', () => {
  it('should render children', () => {
    render(<FadeIn>Hello World</FadeIn>)
    expect(screen.getByText('Hello World')).toBeTruthy()
  })

  it('should forward className to the wrapper element', () => {
    const { container } = render(
      <FadeIn className="custom-class">Content</FadeIn>,
    )
    expect(container.firstElementChild?.className).toContain('custom-class')
  })

  it('should render with default duration and delay', () => {
    const { container } = render(<FadeIn>Content</FadeIn>)
    // Component renders a div wrapper around children
    expect(container.firstElementChild).toBeTruthy()
    expect(screen.getByText('Content')).toBeTruthy()
  })

  it('should accept custom duration and delay props', () => {
    render(
      <FadeIn duration={0.5} delay={0.2}>
        Custom timing
      </FadeIn>,
    )
    expect(screen.getByText('Custom timing')).toBeTruthy()
  })

  it('should render complex children (JSX elements)', () => {
    render(
      <FadeIn>
        <div data-testid="child-1">First</div>
        <div data-testid="child-2">Second</div>
      </FadeIn>,
    )
    expect(screen.getByTestId('child-1')).toBeTruthy()
    expect(screen.getByTestId('child-2')).toBeTruthy()
  })

  it('should have a data-testid attribute for testing', () => {
    render(<FadeIn data-testid="fade-wrapper">Content</FadeIn>)
    expect(screen.getByTestId('fade-wrapper')).toBeTruthy()
  })
})
