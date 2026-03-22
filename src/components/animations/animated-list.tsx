/**
 * AnimatedList — wraps children with staggered fade-in animations.
 * Each child animates in sequence with a configurable delay between items.
 * Uses CSS animations with incremental animation-delay.
 */

import { Children } from 'react'

interface AnimatedListProps extends React.ComponentProps<'div'> {
  /** Delay between each item's animation in seconds (default: 0.05) */
  readonly staggerDelay?: number
  readonly children?: React.ReactNode
}

export function AnimatedList({
  children,
  staggerDelay = 0.05,
  className,
  ...rest
}: AnimatedListProps) {
  return (
    <div className={className} {...rest}>
      {Children.map(children, (child, index) => (
        <div
          style={{
            animation: `list-item-enter 0.25s ease-out ${index * staggerDelay}s both`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
