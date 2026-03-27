import { useRef, useState, useEffect, useCallback } from 'react'

/**
 * Hook for CSS Grid masonry layout.
 *
 * Two-phase render:
 * 1. Before measurement: gridAutoRows is 'auto' → items render at natural height
 * 2. After measurement: gridAutoRows is '1px' with calculated spans → tight packing
 *
 * Usage:
 *   const { containerRef, getSpan, measured } = useMasonryGrid(items.length, gap)
 *   <div ref={containerRef} className="grid grid-cols-3"
 *     style={{ gridAutoRows: measured ? 1 : undefined, gap: measured ? '0 12px' : '12px' }}>
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

    // Calculate spans: each base row is 1px, gap between rows is also applied
    // Cell height = span * 1 + (span - 1) * gap
    // We need: span * 1 + (span - 1) * gap >= contentHeight
    // span * (1 + gap) - gap >= contentHeight
    // span >= (contentHeight + gap) / (1 + gap)
    const rowHeight = 1
    const newSpans = heights.map(h => Math.ceil((h + gap) / (rowHeight + gap)))

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
