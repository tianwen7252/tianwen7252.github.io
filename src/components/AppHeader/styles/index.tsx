import { css } from '@emotion/react'

import { HEADER_HEIGHT } from 'src/styles'

export const headerCss = css`
  background: radial-gradient(circle at 10% 20%, #b0e5d0 42%, #c0e9f9 93.6%);
  /* background: radial-gradient(
    circle at 10% 20%,
    rgb(176, 229, 208) 42%,
    rgba(92, 202, 238, 0.41) 93.6%
  ); */
  padding: 0 20px;
  height: ${HEADER_HEIGHT};
  position: sticky;
  top: 0;
  z-index: 870;

  &.resta-header--active {
    box-shadow:
      0 0 #000,
      0 0 #0000,
      0 0 #000,
      0 0 #0000,
      0 16px 32px -16px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(0, 0, 0, 0.1);
  }
`
export const logoCss = css`
  margin-right: 10px;
  &:hover {
    cursor: pointer;
    filter: drop-shadow(0 0 1em #646cffaa);
  }
`

export const menuCss = css`
  background: transparent;
  margin-left: auto;
`
