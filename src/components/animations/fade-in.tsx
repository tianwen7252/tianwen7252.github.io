/**
 * FadeIn — wrapper component that fades children in on mount.
 * Uses CSS animations for GPU-accelerated opacity transitions.
 */

interface FadeInProps extends React.ComponentProps<'div'> {
  /** Fade duration in seconds (default: 0.3) */
  readonly duration?: number
  /** Delay before fade starts in seconds (default: 0) */
  readonly delay?: number
  readonly children: React.ReactNode
}

export function FadeIn({
  children,
  duration = 0.3,
  delay = 0,
  className,
  style,
  ...rest
}: FadeInProps) {
  return (
    <div
      className={className}
      style={{
        animation: `fade-in ${duration}s ease-out ${delay}s both`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
