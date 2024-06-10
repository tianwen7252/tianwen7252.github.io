import { css } from '@emotion/react'

import { HEADER_HEIGHT } from 'src/styles'

export const headerCss = css`
  background: radial-gradient(
    circle at 10% 20%,
    rgb(176, 229, 208) 42%,
    rgba(92, 202, 238, 0.41) 93.6%
  );
  padding: 0 20px;
  height: ${HEADER_HEIGHT};
`
export const logoCss = css`
  &:hover {
    cursor: pointer;
    filter: drop-shadow(0 0 1em #646cffaa);
  }
`

export const menuCss = css`
  background: transparent;
  margin-left: auto;
`
