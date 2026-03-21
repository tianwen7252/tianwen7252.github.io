import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageTransition } from './page-transition'

describe('PageTransition', () => {
  it('should render children', () => {
    render(
      <PageTransition>
        <div>Page content</div>
      </PageTransition>,
    )
    expect(screen.getByText('Page content')).toBeTruthy()
  })

  it('should forward className to the wrapper element', () => {
    const { container } = render(
      <PageTransition className="page-wrapper">
        <div>Content</div>
      </PageTransition>,
    )
    expect(container.firstElementChild?.className).toContain('page-wrapper')
  })

  it('should render complex page content', () => {
    render(
      <PageTransition>
        <header data-testid="header">Header</header>
        <main data-testid="main">Main</main>
        <footer data-testid="footer">Footer</footer>
      </PageTransition>,
    )
    expect(screen.getByTestId('header')).toBeTruthy()
    expect(screen.getByTestId('main')).toBeTruthy()
    expect(screen.getByTestId('footer')).toBeTruthy()
  })

  it('should accept custom duration', () => {
    render(
      <PageTransition duration={0.5}>
        <div>Custom duration</div>
      </PageTransition>,
    )
    expect(screen.getByText('Custom duration')).toBeTruthy()
  })
})
