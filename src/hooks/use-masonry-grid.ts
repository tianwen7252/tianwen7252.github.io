import { useRef, useState, useEffect, useCallback } from 'react'

/**
 * Hook that measures child elements and returns grid-row span values
 * for a CSS Grid masonry layout.
 *
 * Usage:
 *   const { containerRef, getSpan } = useMasonryGrid(items.length, rowHeight, gap)
 *   <div ref={containerRef} style={{ gridAutoRows: rowHeight }}>
 *     {items.map((item, i) => (
 *       <div key={item.id} style={{ gridRowEnd: `span ${getSpan(i)}` }}>...</div>
 *     ))}
 *   </div>
 */
export function useMasonryGrid(itemCount: number, rowHeight = 1, gap = 12) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [spans, setSpans] = useState<number[]>([])

  const measure = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const children = Array.from(container.children) as HTMLElement[]
    const newSpans: number[] = []

    for (const child of children) {
      // Measure the actual content height of each child
      const contentHeight = child.scrollHeight
      // Calculate how many base rows this item spans (include gap)
      const span = Math.ceil((contentHeight + gap) / (rowHeight + gap))
      newSpans.push(span)
    }

    setSpans(newSpans)
  }, [rowHeight, gap])

  useEffect(() => {
    measure()

    // Re-measure when children change size
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(() => measure())
    // Observe each child element
    for (const child of Array.from(container.children)) {
      observer.observe(child)
    }

    return () => observer.disconnect()
  }, [itemCount, measure])

  /** Get the grid-row span for item at index. Defaults to 1 before measurement. */
  const getSpan = useCallback(
    (index: number): number => spans[index] ?? 1,
    [spans],
  )

  return { containerRef, getSpan }
}
