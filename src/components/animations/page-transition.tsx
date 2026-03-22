/**
 * PageTransition — wrapper that applies a subtle fade + slide-up animation
 * when a page mounts. Designed for use around route page components.
 */

import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'

interface PageTransitionProps
  extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'transition' | 'style'> {
  /** Animation duration in seconds (default: 0.25) */
  readonly duration?: number
  readonly children: React.ReactNode
}

export function PageTransition({
  children,
  duration = 0.25,
  className,
  ...rest
}: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, ease: 'easeOut' }}
      className={className}
      style={{ willChange: 'transform, opacity' }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
