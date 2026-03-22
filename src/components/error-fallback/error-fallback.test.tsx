import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorFallback } from './error-fallback'

describe('ErrorFallback', () => {
  const defaultProps = {
    error: new Error('Something went wrong'),
    resetErrorBoundary: vi.fn(),
  }

  it('should render the error message', () => {
    render(<ErrorFallback {...defaultProps} />)
    expect(screen.getByText('Something went wrong')).toBeTruthy()
  })

  it('should render the default title when none provided', () => {
    render(<ErrorFallback {...defaultProps} />)
    expect(screen.getByText('發生錯誤')).toBeTruthy()
  })

  it('should render a custom title when provided', () => {
    render(<ErrorFallback {...defaultProps} title="自訂錯誤標題" />)
    expect(screen.getByText('自訂錯誤標題')).toBeTruthy()
  })

  it('should show fallback text when error.message is empty', () => {
    render(
      <ErrorFallback
        error={new Error('')}
        resetErrorBoundary={defaultProps.resetErrorBoundary}
      />,
    )
    expect(screen.getByText('未知錯誤')).toBeTruthy()
  })

  it('should call resetErrorBoundary when retry button is clicked', async () => {
    const resetFn = vi.fn()
    const user = userEvent.setup()
    render(
      <ErrorFallback error={defaultProps.error} resetErrorBoundary={resetFn} />,
    )
    await user.click(screen.getByRole('button', { name: '重試' }))
    expect(resetFn).toHaveBeenCalledTimes(1)
  })

  it('should have role="alert" for accessibility', () => {
    render(<ErrorFallback {...defaultProps} />)
    expect(screen.getByRole('alert')).toBeTruthy()
  })

  it('should render the retry button with correct text', () => {
    render(<ErrorFallback {...defaultProps} />)
    expect(screen.getByRole('button', { name: '重試' })).toBeTruthy()
  })

  it('should handle string error values', () => {
    render(
      <ErrorFallback
        error="A string error"
        resetErrorBoundary={defaultProps.resetErrorBoundary}
      />,
    )
    expect(screen.getByText('A string error')).toBeTruthy()
  })

  it('should show fallback text for non-Error, non-string thrown values', () => {
    render(
      <ErrorFallback
        error={42}
        resetErrorBoundary={defaultProps.resetErrorBoundary}
      />,
    )
    expect(screen.getByText('未知錯誤')).toBeTruthy()
  })

  it('should show fallback text for empty string error', () => {
    render(
      <ErrorFallback
        error=""
        resetErrorBoundary={defaultProps.resetErrorBoundary}
      />,
    )
    expect(screen.getByText('未知錯誤')).toBeTruthy()
  })
})
