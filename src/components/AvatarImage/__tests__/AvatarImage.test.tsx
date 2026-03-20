import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { AvatarImage } from '../AvatarImage'

describe('AvatarImage Component', () => {
  // -- Fallback icon rendering --

  it('renders UserOutlined fallback when avatar is undefined', () => {
    const { container } = render(<AvatarImage />)
    // Ant Design UserOutlined renders as a <span> with role="img" and aria-label="user"
    const icon = container.querySelector('[aria-label="user"]')
    expect(icon).toBeInTheDocument()
  })

  it('renders UserOutlined fallback when avatar is empty string', () => {
    const { container } = render(<AvatarImage avatar="" />)
    const icon = container.querySelector('[aria-label="user"]')
    expect(icon).toBeInTheDocument()
  })

  // -- Image rendering for "images/" paths --

  it('renders img element when avatar starts with "images/"', () => {
    render(<AvatarImage avatar="images/aminals/780258.png" />)
    const img = screen.getByRole('img', { name: 'avatar' })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'images/aminals/780258.png')
  })

  it('applies round style to img when avatar starts with "images/"', () => {
    render(<AvatarImage avatar="images/aminals/780258.png" />)
    const img = screen.getByRole('img', { name: 'avatar' })
    expect(img).toHaveStyle({
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      objectFit: 'cover',
    })
  })

  // -- Image rendering for "http" paths --

  it('renders img element when avatar starts with "http"', () => {
    render(<AvatarImage avatar="https://example.com/photo.png" />)
    const img = screen.getByRole('img', { name: 'avatar' })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/photo.png')
  })

  it('renders img element when avatar starts with "http" (no https)', () => {
    render(<AvatarImage avatar="http://example.com/photo.png" />)
    const img = screen.getByRole('img', { name: 'avatar' })
    expect(img).toHaveAttribute('src', 'http://example.com/photo.png')
  })

  // -- Default size (36) --

  it('uses default size of 36 when size prop is not provided', () => {
    render(<AvatarImage avatar="images/aminals/780258.png" />)
    const img = screen.getByRole('img', { name: 'avatar' })
    expect(img).toHaveStyle({ width: '36px', height: '36px' })
  })

  // -- Custom size --

  it('applies custom size to img element', () => {
    render(<AvatarImage avatar="images/aminals/780258.png" size={40} />)
    const img = screen.getByRole('img', { name: 'avatar' })
    expect(img).toHaveStyle({ width: '40px', height: '40px' })
  })

  it('applies custom size to fallback icon font-size', () => {
    const { container } = render(<AvatarImage size={48} />)
    const icon = container.querySelector('[aria-label="user"]')
    expect(icon).toBeInTheDocument()
    // The icon wrapper span should have fontSize matching size
    const iconParent = icon?.closest('span.anticon')
    expect(iconParent).toHaveStyle({ fontSize: '48px' })
  })

  // -- Edge cases --

  it('renders fallback for non-image string values (not images/ or http)', () => {
    const { container } = render(<AvatarImage avatar="some-random-text" />)
    const icon = container.querySelector('[aria-label="user"]')
    expect(icon).toBeInTheDocument()
  })

  it('renders fallback for emoji-only avatar values', () => {
    const { container } = render(<AvatarImage avatar="cat-emoji" />)
    const icon = container.querySelector('[aria-label="user"]')
    expect(icon).toBeInTheDocument()
  })

  it('does not render an img element when avatar is undefined', () => {
    render(<AvatarImage />)
    const img = screen.queryByRole('img', { name: 'avatar' })
    expect(img).not.toBeInTheDocument()
  })

  it('renders img for avatar path with nested directories', () => {
    render(<AvatarImage avatar="images/avatars/set2/cat.png" />)
    const img = screen.getByRole('img', { name: 'avatar' })
    expect(img).toHaveAttribute('src', 'images/avatars/set2/cat.png')
  })
})
