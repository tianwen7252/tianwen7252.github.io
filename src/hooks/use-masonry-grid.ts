import { useRef, useState, useEffect, useCallback } from 'react'

interface MasonryPosition {
  readonly x: number
  readonly y: number
  readonly width: number
}

interface MasonryLayout {
  /** Absolute position for each item (index-aligned) */
  readonly positions: readonly MasonryPosition[]
  /** Total container height to set on the parent */
  readonly height: number
}

const EMPTY_LAYOUT: MasonryLayout = { positions: [], height: 0 }

/**
 * Hook for masonry layout using absolute positioning.
 *
 * Items are assigned to columns in row-first order (left-to-right),
 * and each column independently tracks its height for tight packing.
 *
 * Two-phase render:
 * 1. Before measurement: items render in a normal CSS grid for natural sizing
 * 2. After measurement: container is position:relative with calculated height,
 *    each item is position:absolute at its computed (x, y) coordinate
 */
export function useMasonryGrid(itemCount: number, cols = 3, gap = 12) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<MasonryLayout>(EMPTY_LAYOUT)
  const measured = layout.positions.length === itemCount && itemCount > 0

  const measure = useCallback(() => {
    const container = containerRef.current
    if (!container || container.children.length === 0) return

    const children = Array.from(container.children) as HTMLElement[]

    // Temporarily revert to flow layout to measure natural heights
    const prevPosition = container.style.position
    const prevHeight = container.style.height
    container.style.position = ''
    container.style.height = ''
    for (const child of children) {
      child.style.position = ''
      child.style.left = ''
      child.style.top = ''
      child.style.width = ''
    }

    // Force reflow and measure
    const containerWidth = container.clientWidth
    const colWidth = (containerWidth - gap * (cols - 1)) / cols
    const heights = children.map(child => child.getBoundingClientRect().height)

    // Calculate positions: row-first assignment to columns
    const colHeights = new Array(cols).fill(0) as number[]
    const positions: MasonryPosition[] = []

    for (let i = 0; i < heights.length; i++) {
      const col = i % cols
      const x = col * (colWidth + gap)
      const y = colHeights[col] ?? 0
      const h = heights[i] ?? 0

      positions.push({ x, y, width: colWidth })
      colHeights[col] = y + h + gap
    }

    const totalHeight = Math.max(...colHeights) - gap

    // Restore container style before React re-render
    container.style.position = prevPosition
    container.style.height = prevHeight

    setLayout({ positions, height: Math.max(0, totalHeight) })
  }, [cols, gap])

  useEffect(() => {
    const raf = requestAnimationFrame(() => measure())

    const container = containerRef.current
    if (!container) return () => cancelAnimationFrame(raf)

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => measure())
    })
    observer.observe(container)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [itemCount, measure])

  return { containerRef, layout, measured }
}
