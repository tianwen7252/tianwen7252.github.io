import React, { useRef, useEffect } from 'react'

import type { Interpolation } from '@emotion/serialize'
import type { Theme } from '@emotion/react'
import * as styles from './styles'

export const StickyHeader: React.FC<{
  cls?: Interpolation<Theme>
  header?: React.ReactNode
  children?: React.ReactNode
}> = ({ cls, header, children }) => {
  const observerRef = useRef<HTMLDivElement>()
  const headerRef = useRef<HTMLDivElement>()

  // set header shadow by IntersectionObserver
  useEffect(() => {
    const observerDom = observerRef.current
    const observer = new IntersectionObserver(([entry]) => {
      headerRef.current &&
        headerRef.current.classList.toggle(
          'resta-header--active',
          !entry.isIntersecting,
        )
    })
    observer.observe(observerDom)
    return () => {
      observer.unobserve(observerDom)
    }
  }, [])
  return (
    <>
      <div id="resta-header-observer" ref={observerRef}></div>
      <header css={[styles.stickyCss, cls]} ref={headerRef}>
        {header || children}
      </header>
    </>
  )
}

export default StickyHeader
