import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SlideIn } from './slide-in'

describe('SlideIn', () => {
  it('should render children', () => {
    render(<SlideIn>Hello World</SlideIn>)
    expect(screen.getByText('Hello World')).toBeTruthy()
  })

  it('should forward className to the wrapper element', () => {
    const { container } = render(
      <SlideIn className="custom-slide">Content</SlideIn>,
    )
    expect(container.firstElementChild?.className).toContain('custom-slide')
  })

  it('should default to "up" direction', () => {
    const { container } = render(<SlideIn>Content</SlideIn>)
    expect(container.firstElementChild).toBeTruthy()
    expect(screen.getByText('Content')).toBeTruthy()
  })

  it('should accept direction="down"', () => {
    render(<SlideIn direction="down">Down content</SlideIn>)
    expect(screen.getByText('Down content')).toBeTruthy()
  })

  it('should accept direction="left"', () => {
    render(<SlideIn direction="left">Left content</SlideIn>)
    expect(screen.getByText('Left content')).toBeTruthy()
  })

  it('should accept direction="right"', () => {
    render(<SlideIn direction="right">Right content</SlideIn>)
    expect(screen.getByText('Right content')).toBeTruthy()
  })

  it('should accept custom duration and delay', () => {
    render(
      <SlideIn duration={0.5} delay={0.1} distance={30}>
        Timed content
      </SlideIn>,
    )
    expect(screen.getByText('Timed content')).toBeTruthy()
  })

  it('should accept custom distance', () => {
    render(<SlideIn distance={50}>Far slide</SlideIn>)
    expect(screen.getByText('Far slide')).toBeTruthy()
  })

  it('should render complex children', () => {
    render(
      <SlideIn>
        <span data-testid="inner">Nested</span>
      </SlideIn>,
    )
    expect(screen.getByTestId('inner')).toBeTruthy()
  })

  it('should have a data-testid attribute for testing', () => {
    render(<SlideIn data-testid="slide-wrapper">Content</SlideIn>)
    expect(screen.getByTestId('slide-wrapper')).toBeTruthy()
  })
})
