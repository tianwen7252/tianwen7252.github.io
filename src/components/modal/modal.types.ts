export type GradientVariant = 'green' | 'warm' | 'red'

/** Preset shine color names or custom ShineBorder color format */
export type ShineColorPreset = 'green' | 'purple' | 'red'
export type ShineColor = ShineColorPreset | string | string[]

export interface InfoItem {
  readonly label: string
  readonly value: string
}

/**
 * GlassModal — base glassmorphism modal with gradient background.
 * Supports any content: confirmation, forms, info display, etc.
 */
export interface GlassModalProps {
  /** Whether the modal is open */
  readonly open: boolean
  /** Gradient background variant */
  readonly variant?: GradientVariant
  /** System label shown above the title */
  readonly systemLabel?: string
  /** Modal title text */
  readonly title: string
  /** Modal content — renders inside the glass card */
  readonly children: React.ReactNode
  /** Footer content — renders below the glass card (buttons, etc.) */
  readonly footer?: React.ReactNode
  /** Animated shine border color. Omit for no shine effect. */
  readonly shineColor?: ShineColor
  /** Called when modal is dismissed (backdrop click, escape key) */
  readonly onClose: () => void
}

/**
 * GlassCard — inner card within GlassModal for grouping content.
 * Pre-styled with frosted glass effect.
 */
export interface GlassCardProps {
  readonly children: React.ReactNode
  readonly className?: string
}

/**
 * ConfirmModal — specialized GlassModal for confirmation actions.
 * Built on top of GlassModal with avatar, info grid, and confirm/cancel buttons.
 */
export interface ConfirmModalProps {
  readonly open: boolean
  readonly title: string
  readonly variant?: GradientVariant
  readonly systemLabel?: string
  readonly avatar?: string
  readonly name?: string
  readonly roleLabel?: string
  readonly hint?: string
  readonly infoItems?: readonly InfoItem[]
  readonly confirmText?: string
  readonly cancelText?: string
  readonly loading?: boolean
  /** Animated shine border color. Omit for no shine effect. */
  readonly shineColor?: ShineColor
  readonly onConfirm: () => void
  readonly onCancel: () => void
}
