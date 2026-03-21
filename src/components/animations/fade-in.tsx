/**
 * FadeIn — wrapper component that fades children in on mount.
 * Uses framer-motion for GPU-accelerated opacity transitions.
 */

import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'

interface FadeInProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'exit' | 'transition' | 'style'> {
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
  ...rest
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay }}
      className={className}
      style={{ willChange: 'opacity' }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
