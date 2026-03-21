import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmModal, GlassModal, GlassCard } from './confirm-modal'

describe('GlassCard', () => {
  it('should render children', () => {
    render(<GlassCard>Card content</GlassCard>)
    expect(screen.getByText('Card content')).toBeTruthy()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <GlassCard className="custom-class">Content</GlassCard>,
    )
    expect(container.firstElementChild?.className).toContain('custom-class')
  })
})

describe('GlassModal', () => {
  it('should render title and children when open', () => {
    render(
      <GlassModal open title="Test Modal" onClose={() => {}}>
        <div>Modal content</div>
      </GlassModal>,
    )
    // Title appears twice: sr-only (accessibility) + visual
    expect(screen.getAllByText('Test Modal')).toHaveLength(2)
    expect(screen.getByText('Modal content')).toBeTruthy()
  })

  it('should render system label when provided', () => {
    render(
      <GlassModal open title="Test" systemLabel="System" onClose={() => {}}>
        Content
      </GlassModal>,
    )
    expect(screen.getByText('System')).toBeTruthy()
  })

  it('should render footer when provided', () => {
    render(
      <GlassModal
        open
        title="Test"
        footer={<button>Footer button</button>}
        onClose={() => {}}
      >
        Content
      </GlassModal>,
    )
    expect(screen.getByText('Footer button')).toBeTruthy()
  })

  it('should not render when closed', () => {
    render(
      <GlassModal open={false} title="Hidden" onClose={() => {}}>
        Content
      </GlassModal>,
    )
    expect(screen.queryByText('Hidden')).toBeNull()
  })
})

describe('ConfirmModal', () => {
  const defaultProps = {
    open: true,
    title: '確認打卡？',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  }

  it('should render title and default system label', () => {
    render(<ConfirmModal {...defaultProps} />)
    // Title appears twice: sr-only (accessibility) + visual
    expect(screen.getAllByText('確認打卡？')).toHaveLength(2)
    expect(screen.getByText('系統確認')).toBeTruthy()
  })

  it('should render name and role label', () => {
    render(<ConfirmModal {...defaultProps} name="小明" roleLabel="管理員" />)
    expect(screen.getByText('小明')).toBeTruthy()
    expect(screen.getByText('管理員')).toBeTruthy()
  })

  it('should render hint text', () => {
    render(<ConfirmModal {...defaultProps} hint="目前下班時間: 18:00" />)
    expect(screen.getByText('目前下班時間: 18:00')).toBeTruthy()
  })

  it('should render info items', () => {
    render(
      <ConfirmModal
        {...defaultProps}
        infoItems={[
          { label: '目前時間', value: '09:30 AM' },
          { label: '班別類型', value: '正常班' },
        ]}
      />,
    )
    expect(screen.getByText('目前時間')).toBeTruthy()
    expect(screen.getByText('09:30 AM')).toBeTruthy()
    expect(screen.getByText('班別類型')).toBeTruthy()
    expect(screen.getByText('正常班')).toBeTruthy()
  })

  it('should render custom button text', () => {
    render(
      <ConfirmModal
        {...defaultProps}
        confirmText="確認打卡"
        cancelText="返回"
      />,
    )
    expect(screen.getByText('確認打卡')).toBeTruthy()
    expect(screen.getByText('返回')).toBeTruthy()
  })

  it('should call onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />)
    await user.click(screen.getByText('確認'))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ConfirmModal {...defaultProps} onCancel={onCancel} />)
    await user.click(screen.getByText('取消'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('should disable confirm button when loading', () => {
    render(<ConfirmModal {...defaultProps} loading />)
    const btn = screen.getByText('確認')
    expect(btn.closest('button')?.disabled).toBe(true)
  })
})
