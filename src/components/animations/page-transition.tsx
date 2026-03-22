/**
 * PageTransition — wrapper that applies a subtle fade + slide-up animation
 * when a page mounts. Uses CSS animations instead of framer-motion.
 */

interface PageTransitionProps extends React.ComponentProps<'div'> {
  /** Animation duration in seconds (default: 0.25) */
  readonly duration?: number
  readonly children: React.ReactNode
}

export function PageTransition({
  children,
  duration = 0.25,
  className,
  style,
  ...rest
}: PageTransitionProps) {
  return (
    <div
      className={className}
      style={{
        animation: `page-enter ${duration}s ease-out`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
