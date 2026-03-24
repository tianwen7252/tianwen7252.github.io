export type GradientVariant = 'green' | 'warm' | 'red'

/** Preset shine color names or custom ShineBorder color format */
export type ShineColorPreset = 'green' | 'purple' | 'red'
export type ShineColor = ShineColorPreset | string | string[]

/**
 * Modal — base glassmorphism modal with gradient background.
 * Supports any content: confirmation, forms, info display, etc.
 */
export interface ModalProps {
  /** Whether the modal is open */
  readonly open: boolean
  /** Gradient background variant */
  readonly variant?: GradientVariant
  /** Header text shown above the title (e.g. "系統確認") */
  readonly header?: string
  /** Modal title — plain text or JSX */
  readonly title: React.ReactNode
  /** Modal content — renders inside the glassmorphism container */
  readonly children: React.ReactNode
  /** Footer content — renders below children (buttons, etc.) */
  readonly footer?: React.ReactNode
  /** Animated shine border color. Omit for no shine effect. */
  readonly shineColor?: ShineColor
  /** Container width in px or CSS string (default: 500) */
  readonly width?: number | string
  /** Container height in px or CSS string. When set, content fills the space and footer pins to bottom. */
  readonly height?: number | string
  /** Show loading spinner overlay */
  readonly loading?: boolean
  /** Whether clicking the backdrop closes the modal (default: true) */
  readonly closeOnBackdropClick?: boolean
  /** Called when modal is dismissed (backdrop click, escape key) */
  readonly onClose: () => void
}

/**
 * ModalCard — inner card within Modal for grouping content.
 * Pre-styled with frosted glass effect.
 */
export interface ModalCardProps {
  readonly children: React.ReactNode
  readonly className?: string
}

/**
 * ConfirmModal — specialized Modal for confirmation actions.
 * Content is passed as children (avatar, info, etc.).
 */
export interface ConfirmModalProps {
  readonly open: boolean
  readonly title: React.ReactNode
  readonly variant?: GradientVariant
  readonly header?: string
  readonly children?: React.ReactNode
  readonly confirmText?: string
  readonly cancelText?: string
  readonly loading?: boolean
  readonly shineColor?: ShineColor
  readonly onConfirm: () => void
  readonly onCancel: () => void
}
