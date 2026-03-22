/**
 * AnimatedList — wraps children with staggered fade-in animations.
 * Each child animates in sequence with a configurable delay between items.
 */

import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import { Children } from 'react'

interface AnimatedListProps
  extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'transition' | 'style'> {
  /** Delay between each item's animation in seconds (default: 0.05) */
  readonly staggerDelay?: number
  readonly children?: React.ReactNode
}

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
} as const

export function AnimatedList({
  children,
  staggerDelay = 0.05,
  className,
  ...rest
}: AnimatedListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: staggerDelay }}
      className={className}
      {...rest}
    >
      {Children.map(children, child => (
        <motion.div
          variants={ITEM_VARIANTS}
          transition={{ duration: 0.25 }}
          style={{ willChange: 'transform, opacity' }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
