import { useState, useEffect } from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ShineBorder } from '@/components/ui/shine-border'
import type {
  ModalProps,
  ModalCardProps,
  ConfirmModalProps,
  GradientVariant,
  ShineColor,
  ShineColorPreset,
} from './modal.types'
import './modal.css'

// V1 exact color tokens
const COLOR_TEXT = '#1a202c'
const COLOR_MUTED = '#718096'
const COLOR_PRIMARY = '#7f956a'
const COLOR_RED = '#ff6467'

const GRADIENT_CLASS: Record<GradientVariant, string> = {
  green: 'model-green',
  warm: 'model-warm',
  red: 'model-red',
}

const CONFIRM_BUTTON_BG: Record<GradientVariant, string> = {
  green: COLOR_PRIMARY,
  warm: '#ad9ac0',
  red: COLOR_RED,
}

// Preset shine color combinations (3 colors each for animated gradient shine)
const SHINE_COLOR_PRESETS: Record<ShineColorPreset, string[]> = {
  green: ['#a8c896', '#c8deb8', '#e4fad9'],
  purple: ['#c4a1e0', '#dcc4f0', '#e3d0f5'],
  red: ['#e39a9d', '#f4b6b7', '#f0c4c4'],
}

function resolveShineColor(shineColor: ShineColor): string | string[] {
  if (typeof shineColor === 'string' && shineColor in SHINE_COLOR_PRESETS) {
    return SHINE_COLOR_PRESETS[shineColor as ShineColorPreset]
  }
  return shineColor
}

// ─── ModalCard ───────────────────────────────────────────────────────────────

/**
 * Frosted glass card — use inside Modal for content grouping.
 * V1: bg rgba(255,255,255,0.4), border rgba(255,255,255,0.2), radius 12px, padding 24px
 */
export function ModalCard({ children, className }: ModalCardProps) {
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

// ─── Modal ───────────────────────────────────────────────────────────────────

/**
 * Base glassmorphism modal with mesh gradient background.
 * Uses raw Radix Dialog primitives for full control over rendering.
 */
export function Modal({
  open,
  variant = 'green',
  header,
  title,
  children,
  footer,
  shineColor,
  loading = false,
  onClose,
}: ModalProps) {
  // Delay Radix unmount so close animation plays first.
  // dialogOpen stays true during close animation; closing triggers CSS exit classes.
  const [dialogOpen, setDialogOpen] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (open) {
      setDialogOpen(true)
      setClosing(false)
    } else if (dialogOpen) {
      // In test env, CSS animations don't run — close immediately
      if (import.meta.env.MODE === 'test') {
        setDialogOpen(false)
        return
      }
      setClosing(true)
      // Fallback: unmount after animation duration if animationend doesn't fire
      const timer = setTimeout(() => {
        setClosing(false)
        setDialogOpen(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [open, dialogOpen])

  function handleCloseAnimationEnd(e: React.AnimationEvent) {
    if (closing && e.animationName === 'overlay-fade-out') {
      setClosing(false)
      setDialogOpen(false)
    }
  }

  return (
    <DialogPrimitive.Root
      open={dialogOpen}
      onOpenChange={(o) => !o && onClose()}
    >
      <DialogPrimitive.Portal>
        {/* Full-screen gradient overlay with fade animation */}
        <DialogPrimitive.Overlay
          className={cn(
            'glass-modal-overlay fixed inset-0 z-50',
            GRADIENT_CLASS[variant],
            closing && 'glass-modal-closing',
          )}
          onAnimationEnd={handleCloseAnimationEnd}
        />

        {/* Content — centered, with zoom animation (antd style) */}
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            'glass-modal-content fixed inset-0 z-50 flex items-center justify-center outline-none',
            closing && 'glass-modal-closing',
          )}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
          onEscapeKeyDown={onClose}
        >
          {/* Accessible title (sr-only) */}
          <DialogPrimitive.Title className="sr-only">
            {title}
          </DialogPrimitive.Title>

          {/* Glassmorphism container with CSS entrance/exit animation */}
          <div
            className={cn(
              'relative',
              closing ? 'animate-modal-exit' : 'animate-modal-enter',
            )}
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: shineColor
                ? 'none'
                : '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
              borderRadius: 16,
              padding: 40,
              width: 500,
              maxWidth: 'calc(100vw - 32px)',
              overflow: 'hidden',
            }}
          >
            {/* Animated shine border */}
            {shineColor && (
              <ShineBorder
                shineColor={resolveShineColor(shineColor)}
                borderWidth={1}
                duration={20}
              />
            )}

            {/* Header */}
            {header && (
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: COLOR_MUTED,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 4,
                  textAlign: 'center',
                }}
              >
                {header}
              </div>
            )}

            {/* Title */}
            <div
              style={{
                fontSize: 22,
                fontWeight: 500,
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

            {/* Loading overlay */}
            {loading && (
              <div
                data-testid="modal-loading-overlay"
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: 16,
                  zIndex: 10,
                }}
              >
                <Loader2
                  size={36}
                  className="animate-spin"
                  style={{ color: COLOR_PRIMARY }}
                />
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

// ─── ConfirmModal ────────────────────────────────────────────────────────────

/**
 * Specialized Modal for confirmation actions.
 * Content is passed as children — avatar, info grid, etc.
 */
export function ConfirmModal({
  open,
  title,
  variant = 'green',
  header,
  children,
  confirmText,
  cancelText,
  loading = false,
  shineColor,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { t } = useTranslation()
  const resolvedHeader = header ?? t('common.systemConfirm')
  const resolvedConfirmText = confirmText ?? t('common.confirm')
  const resolvedCancelText = cancelText ?? t('common.cancel')
  return (
    <Modal
      open={open}
      variant={variant}
      header={resolvedHeader}
      title={title}
      shineColor={shineColor}
      loading={loading}
      onClose={onCancel}
      footer={
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              color: '#4a5568',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              padding: '12px 16px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'transform 0.15s ease',
              flex: 1,
            }}
            className={cn(!loading && 'hover:-translate-y-0.5')}
          >
            {resolvedCancelText}
          </button>
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
            {resolvedConfirmText}
          </button>
        </div>
      }
    >
      {children}
    </Modal>
  )
}
