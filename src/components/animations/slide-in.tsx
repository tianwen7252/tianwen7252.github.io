/**
 * SlideIn — wrapper component that slides children in from a given direction.
 * Uses framer-motion for GPU-accelerated transform transitions.
 */

import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'

type Direction = 'up' | 'down' | 'left' | 'right'

interface SlideInProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'exit' | 'transition' | 'style'> {
  /** Slide direction (default: 'up') */
  readonly direction?: Direction
  /** Slide distance in pixels (default: 20) */
  readonly distance?: number
  /** Animation duration in seconds (default: 0.3) */
  readonly duration?: number
  /** Delay before animation starts in seconds (default: 0) */
  readonly delay?: number
  readonly children: React.ReactNode
}

/** Compute the initial x/y offset based on direction and distance. */
function getInitialOffset(
  direction: Direction,
  distance: number,
): { x: number; y: number } {
  switch (direction) {
    case 'up':
      return { x: 0, y: distance }
    case 'down':
      return { x: 0, y: -distance }
    case 'left':
      return { x: distance, y: 0 }
    case 'right':
      return { x: -distance, y: 0 }
  }
}

export function SlideIn({
  children,
  direction = 'up',
  distance = 20,
  duration = 0.3,
  delay = 0,
  className,
  ...rest
}: SlideInProps) {
  const offset = getInitialOffset(direction, distance)

  return (
    <motion.div
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: offset.x, y: offset.y }}
      transition={{ duration, delay }}
      className={className}
      style={{ willChange: 'transform, opacity' }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
