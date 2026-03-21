import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/cn'
import { AvatarImage } from '@/components/avatar-image'
import type {
  GlassModalProps,
  GlassCardProps,
  ConfirmModalProps,
  GradientVariant,
} from './modal.types'
import './modal.css'

// V1 exact color tokens
const COLOR_TEXT = '#1a202c'
const COLOR_MUTED = '#718096'
const COLOR_PRIMARY = '#7f956a'
const COLOR_RED = '#ff6467'
const COLOR_DIVIDER = '#e2e8f0'

const GRADIENT_CLASS: Record<GradientVariant, string> = {
  green: 'confirm-modal-green',
  warm: 'confirm-modal-warm',
  red: 'confirm-modal-red',
}

const CONFIRM_BUTTON_BG: Record<GradientVariant, string> = {
  green: COLOR_PRIMARY,
  warm: COLOR_PRIMARY,
  red: COLOR_RED,
}

// ─── GlassCard ───────────────────────────────────────────────────────────────

/**
 * Frosted glass card — use inside GlassModal for content grouping.
 * V1 spec: bg rgba(255,255,255,0.4), border rgba(255,255,255,0.2), radius 12px, padding 24px
 */
export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn('flex flex-col items-center', className)}
      style={{
        background: 'rgba(255, 255, 255, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 24,
      }}
    >
      {children}
    </div>
  )
}

// ─── GlassModal ──────────────────────────────────────────────────────────────

/**
 * Base glassmorphism modal with mesh gradient background.
 * V1 spec: bg rgba(255,255,255,0.7), blur(20px) saturate(180%), radius 16px, padding 40px
 */
export function GlassModal({
  open,
  variant = 'green',
  systemLabel,
  title,
  children,
  footer,
  onClose,
}: GlassModalProps) {
  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogOverlay className={cn('fixed inset-0', GRADIENT_CLASS[variant])} />
      <DialogContent
        className="border-none bg-transparent p-0 shadow-none sm:max-w-[500px] [&>button]:hidden"
        aria-describedby={undefined}
      >
        {/* Accessible title (visually styled below) */}
        <DialogTitle className="sr-only">{title}</DialogTitle>

        {/* Glassmorphism container — exact V1 values */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
            borderRadius: 16,
            padding: 40,
            maxWidth: 500,
            margin: '0 auto',
          }}
        >
          {/* System label — V1: 14px/500, #718096, uppercase, letter-spacing 0.5px, mb 4px */}
          {systemLabel && (
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: COLOR_MUTED,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 4,
                textAlign: 'center',
              }}
            >
              {systemLabel}
            </div>
          )}

          {/* Title — V1: 20px/700, #1a202c, mb 24px */}
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: COLOR_TEXT,
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            {title}
          </div>

          {/* Content */}
          {children}

          {/* Footer */}
          {footer && <div style={{ marginTop: 24 }}>{footer}</div>}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── ConfirmModal ────────────────────────────────────────────────────────────

/**
 * Specialized GlassModal for confirmation actions.
 * Based on V1 ClockInModal design with avatar, info grid, and action buttons.
 */
export function ConfirmModal({
  open,
  title,
  variant = 'green',
  systemLabel = '系統確認',
  avatar,
  name,
  roleLabel,
  hint,
  infoItems = [],
  confirmText = '確認',
  cancelText = '取消',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <GlassModal
      open={open}
      variant={variant}
      systemLabel={systemLabel}
      title={title}
      onClose={onCancel}
      footer={
        /* Button row — V1: gap 12px, mt 24px (handled by GlassModal footer) */
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            width: '100%',
          }}
        >
          {/* Cancel button — V1 exact */}
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              color: '#4a5568',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              padding: '12px 16px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
              flex: 1,
            }}
            className="hover:-translate-y-0.5"
          >
            {cancelText}
          </button>
          {/* Confirm button — V1 exact */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              background: CONFIRM_BUTTON_BG[variant],
              color: '#fff',
              border: 'none',
              padding: '12px 16px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              flex: 1,
            }}
            className={cn(
              !loading &&
                'hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]',
            )}
          >
            {confirmText}
          </button>
        </div>
      }
    >
      <GlassCard>
        {/* Avatar — V1: rounded, overflow hidden, inline-flex, mb 12px */}
        {(avatar !== undefined || name) && (
          <div
            style={{
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'inline-flex',
              marginBottom: 12,
            }}
          >
            <AvatarImage avatar={avatar} size={120} />
          </div>
        )}

        {/* Name — V1: 24px/700, #1a202c, mb 4px */}
        {name && (
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: COLOR_TEXT,
              marginBottom: 4,
            }}
          >
            {name}
          </div>
        )}

        {/* Role label — V1: 14px/500, #7f956a, mb 8px */}
        {roleLabel && (
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: COLOR_PRIMARY,
              marginBottom: 8,
            }}
          >
            {roleLabel}
          </div>
        )}

        {/* Hint — V1: 13px, #718096, mt 12px */}
        {hint && (
          <div
            style={{
              fontSize: 13,
              color: COLOR_MUTED,
              marginTop: 12,
              textAlign: 'center',
            }}
          >
            {hint}
          </div>
        )}

        {/* Info grid — V1: 2 cols, gap 16px, mt/pt 16px, border-top #e2e8f0 */}
        {infoItems.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              width: '100%',
              marginTop: 16,
              paddingTop: 16,
              borderTop: `1px solid ${COLOR_DIVIDER}`,
            }}
          >
            {infoItems.map(item => (
              <div key={item.label}>
                {/* Label — V1: 12px/500, #718096, uppercase, letter-spacing 0.5px, mb 4px */}
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: COLOR_MUTED,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 4,
                    textAlign: 'center',
                  }}
                >
                  {item.label}
                </div>
                {/* Value — V1: 16px/600, #1a202c */}
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: COLOR_TEXT,
                    textAlign: 'center',
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </GlassModal>
  )
}
