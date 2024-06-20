import { useEffect } from 'react'

export function useObserverDom<T extends HTMLElement>(
  targetRef: React.MutableRefObject<T>,
  callback: (isIntersecting: boolean) => void,
) {
  useEffect(() => {
    const observerDom = targetRef.current
    const observer = new IntersectionObserver(([entry]) => {
      callback(entry.isIntersecting)
    })
    observer.observe(observerDom)
    return () => {
      observer.unobserve(observerDom)
    }
  }, [targetRef, callback])
}
