import { Toaster as Sonner } from 'sonner'

interface ToasterProps {
  readonly position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center'
  readonly richColors?: boolean
  readonly duration?: number
}

/**
 * Toaster wrapper around sonner's Toaster component.
 * Provides sensible defaults for the Tianwen POS app:
 * - top-right position for non-blocking visibility
 * - rich colors for success/error/info variants
 * - 3-second auto-dismiss duration
 */
function Toaster({
  position = 'top-right',
  richColors = true,
  duration = 3000,
  ...props
}: ToasterProps) {
  return (
    <Sonner
      position={position}
      richColors={richColors}
      duration={duration}
      toastOptions={{
        className: 'font-sans',
      }}
      {...props}
    />
  )
}

export { Toaster }
