import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AnimatedList } from './animated-list'

describe('AnimatedList', () => {
  it('should render children items', () => {
    render(
      <AnimatedList>
        <div key="1">Item 1</div>
        <div key="2">Item 2</div>
        <div key="3">Item 3</div>
      </AnimatedList>,
    )
    expect(screen.getByText('Item 1')).toBeTruthy()
    expect(screen.getByText('Item 2')).toBeTruthy()
    expect(screen.getByText('Item 3')).toBeTruthy()
  })

  it('should forward className to the wrapper element', () => {
    const { container } = render(
      <AnimatedList className="list-wrapper">
        <div key="1">Item</div>
      </AnimatedList>,
    )
    expect(container.firstElementChild?.className).toContain('list-wrapper')
  })

  it('should render with empty children', () => {
    const { container } = render(<AnimatedList />)
    expect(container.firstElementChild).toBeTruthy()
  })

  it('should render a single child', () => {
    render(
      <AnimatedList>
        <div key="only">Only item</div>
      </AnimatedList>,
    )
    expect(screen.getByText('Only item')).toBeTruthy()
  })

  it('should render many children', () => {
    const items = Array.from({ length: 20 }, (_, i) => (
      <div key={i}>Item {i}</div>
    ))
    render(<AnimatedList>{items}</AnimatedList>)
    expect(screen.getByText('Item 0')).toBeTruthy()
    expect(screen.getByText('Item 19')).toBeTruthy()
  })

  it('should accept custom stagger delay', () => {
    render(
      <AnimatedList staggerDelay={0.1}>
        <div key="1">Staggered</div>
      </AnimatedList>,
    )
    expect(screen.getByText('Staggered')).toBeTruthy()
  })

  it('should have a data-testid attribute for testing', () => {
    render(
      <AnimatedList data-testid="animated-list">
        <div key="1">Item</div>
      </AnimatedList>,
    )
    expect(screen.getByTestId('animated-list')).toBeTruthy()
  })
})
