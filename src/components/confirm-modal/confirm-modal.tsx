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
} from './confirm-modal.types'
import './confirm-modal.css'

const GRADIENT_CLASS: Record<GradientVariant, string> = {
  green: 'confirm-modal-green',
  warm: 'confirm-modal-warm',
  red: 'confirm-modal-red',
}

const CONFIRM_BUTTON_STYLE: Record<GradientVariant, string> = {
  green: 'bg-[#7f956a] hover:bg-[#6b8058]',
  warm: 'bg-[#7f956a] hover:bg-[#6b8058]',
  red: 'bg-red-600 hover:bg-red-700',
}

// ─── GlassCard ───────────────────────────────────────────────────────────────

/**
 * Frosted glass card — use inside GlassModal for content grouping.
 */
export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-xl border border-white/20 bg-white/40 p-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

// ─── GlassModal ──────────────────────────────────────────────────────────────

/**
 * Base glassmorphism modal with mesh gradient background.
 * Use directly for custom layouts (forms, multi-step flows, etc.)
 * or use ConfirmModal for simple confirmation patterns.
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

        {/* Glassmorphism container */}
        <div className="mx-auto max-w-[500px] rounded-2xl border border-white/30 bg-white/70 p-10 shadow-[0_8px_32px_rgba(31,38,135,0.1)] backdrop-blur-[20px] backdrop-saturate-[180%]">
          {/* System label */}
          {systemLabel && (
            <div className="mb-1 text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {systemLabel}
            </div>
          )}

          {/* Title (visual) */}
          <div className="mb-6 text-center text-xl font-bold text-foreground">
            {title}
          </div>

          {/* Content */}
          {children}

          {/* Footer */}
          {footer && <div className="mt-6">{footer}</div>}
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
        <div className="flex w-full justify-center gap-3">
          <button
            type="button"
            className="flex-1 rounded-lg border border-black/[0.08] bg-white/50 px-4 py-3 text-sm font-semibold text-gray-600 transition-transform hover:-translate-y-0.5"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={cn(
              'flex-1 rounded-lg border-none px-4 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:hover:translate-y-0',
              CONFIRM_BUTTON_STYLE[variant],
            )}
            onClick={onConfirm}
            disabled={loading}
          >
            {confirmText}
          </button>
        </div>
      }
    >
      <GlassCard>
        {/* Avatar */}
        {(avatar !== undefined || name) && (
          <div className="mb-3 overflow-hidden rounded-full">
            <AvatarImage avatar={avatar} size={120} />
          </div>
        )}

        {/* Name */}
        {name && (
          <div className="mb-1 text-2xl font-bold text-foreground">{name}</div>
        )}

        {/* Role label */}
        {roleLabel && (
          <div className="mb-2 text-sm font-medium text-primary">
            {roleLabel}
          </div>
        )}

        {/* Hint */}
        {hint && (
          <div className="mt-3 text-center text-[13px] text-muted-foreground">
            {hint}
          </div>
        )}

        {/* Info grid */}
        {infoItems.length > 0 && (
          <div className="mt-4 grid w-full grid-cols-2 gap-4 border-t border-border pt-4">
            {infoItems.map(item => (
              <div key={item.label}>
                <div className="mb-1 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </div>
                <div className="text-center text-base font-semibold text-foreground">
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
