import { css } from '@emotion/react'

export const headerCss = css``

export const stickyCss = css`
  position: sticky;
  top: 0;
  z-index: 870;

  &.resta-header--active {
    backdrop-filter: blur(10px);
    box-shadow:
      0 0 #000,
      0 0 #0000,
      0 0 #000,
      0 0 #0000,
      0 16px 32px -16px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(0, 0, 0, 0.1);
  }
`
