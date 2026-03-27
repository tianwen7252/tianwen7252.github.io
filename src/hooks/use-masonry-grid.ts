import { useRef, useState, useEffect, useCallback } from 'react'

/**
 * Hook for CSS Grid masonry layout.
 *
 * Two-phase render:
 * 1. Before measurement: grid uses auto row heights → items render naturally
 * 2. After measurement: grid uses 1px base rows with calculated spans → tight packing
 *
 * The grid should use row gap = 0 in masonry mode. Visual gap between cards
 * is achieved by including the desired gap in each item's span calculation.
 *
 * Usage:
 *   const { containerRef, getSpan, measured } = useMasonryGrid(items.length, 12)
 *   <div ref={containerRef} className="grid grid-cols-3"
 *     style={measured ? { gridAutoRows: '1px', gap: '0 12px' } : { gap: 12 }}>
 *     {items.map((item, i) => (
 *       <div key={item.id} style={measured ? { gridRowEnd: `span ${getSpan(i)}` } : undefined}>
 *         ...
 *       </div>
 *     ))}
 *   </div>
 */
export function useMasonryGrid(itemCount: number, gap = 12) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [spans, setSpans] = useState<number[]>([])
  const measured = spans.length === itemCount && itemCount > 0

  const measure = useCallback(() => {
    const container = containerRef.current
    if (!container || container.children.length === 0) return

    // Temporarily revert to auto rows so we can measure natural heights
    const prevAutoRows = container.style.gridAutoRows
    const prevGap = container.style.gap
    container.style.gridAutoRows = 'auto'
    container.style.gap = `${gap}px`

    const children = Array.from(container.children) as HTMLElement[]
    // Remove span overrides temporarily
    const prevSpans = children.map(child => child.style.gridRowEnd)
    for (const child of children) {
      child.style.gridRowEnd = ''
    }

    // Force reflow and measure natural heights
    const heights = children.map(child => child.getBoundingClientRect().height)

    // Calculate spans for masonry mode (gridAutoRows: 1px, row gap: 0).
    // Each span unit = 1px. Visual gap is baked into the span.
    // span = ceil(contentHeight + desiredGap)
    const newSpans = heights.map(h => Math.ceil(h + gap))

    // Restore previous styles (React will re-render with new spans)
    container.style.gridAutoRows = prevAutoRows
    container.style.gap = prevGap
    children.forEach((child, i) => {
      child.style.gridRowEnd = prevSpans[i] ?? ''
    })

    setSpans(newSpans)
  }, [gap])

  useEffect(() => {
    // Defer measurement to after paint
    const raf = requestAnimationFrame(() => measure())

    const container = containerRef.current
    if (!container) return () => cancelAnimationFrame(raf)

    // Re-measure on container resize (e.g., viewport change)
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => measure())
    })
    observer.observe(container)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [itemCount, measure])

  const getSpan = useCallback(
    (index: number): number => spans[index] ?? 1,
    [spans],
  )

  return { containerRef, getSpan, measured }
}
