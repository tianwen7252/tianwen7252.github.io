import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './input'

describe('Input', () => {
  it('should render an input element', () => {
    render(<Input data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.tagName).toBe('INPUT')
  })

  it('should include data-slot="input" attribute', () => {
    render(<Input data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.getAttribute('data-slot')).toBe('input')
  })

  it('should forward type prop', () => {
    render(<Input data-testid="test-input" type="email" />)
    const input = screen.getByTestId('test-input') as HTMLInputElement
    expect(input.type).toBe('email')
  })

  it('should default to text type when not specified', () => {
    render(<Input data-testid="test-input" />)
    const input = screen.getByTestId('test-input') as HTMLInputElement
    expect(input.type).toBe('text')
  })

  it('should forward className prop', () => {
    render(<Input data-testid="test-input" className="custom-class" />)
    const input = screen.getByTestId('test-input')
    expect(input.className).toContain('custom-class')
  })

  it('should forward placeholder prop', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeTruthy()
  })

  it('should forward value and onChange props', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Input data-testid="test-input" onChange={onChange} />)
    const input = screen.getByTestId('test-input')
    await user.type(input, 'a')
    expect(onChange).toHaveBeenCalled()
  })

  it('should forward disabled prop', () => {
    render(<Input data-testid="test-input" disabled />)
    const input = screen.getByTestId('test-input') as HTMLInputElement
    expect(input.disabled).toBe(true)
  })

  it('should forward id prop', () => {
    render(<Input id="my-input" data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.id).toBe('my-input')
  })

  it('should apply default styling classes', () => {
    render(<Input data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.className).toContain('rounded-md')
    expect(input.className).toContain('border')
  })

  it('should support aria-invalid attribute', () => {
    render(<Input data-testid="test-input" aria-invalid="true" />)
    const input = screen.getByTestId('test-input')
    expect(input.getAttribute('aria-invalid')).toBe('true')
  })
})
