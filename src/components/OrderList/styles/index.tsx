import { css } from '@emotion/react'

import { getCalcWidth, getCalcHeight } from 'src/styles/variables'

export const mainCss = css`
  position: relative;
  padding: 20px;
  /* width: ${getCalcWidth(40)}; */
  min-height: ${getCalcHeight(40)};
`

export const orderListCss = css`
  overflow-x: hidden;
  overflow-y: auto;
  width: 100%;

  .ant-select,
  .ant-input-affix-wrapper {
    margin-bottom: 1rem;
  }
`

export const drawerCss = css`
  position: relative;
`

export const contentCss = css`
  /* justify-content: center; */
`

export const panelCss = css`
  border-radius: 20px;
  padding: 20px;
  margin: 20px 0;
  position: relative;

  &::after {
    content: attr(data-title);
    position: absolute;
    top: 0;
    right: 0;
    font-size: 1rem;
    padding: 1rem;
    background: #ffffff70;
    border-radius: 0 20px 0 20px;
    color: #666;
  }
`

export const emptyCss = css`
  width: 100%;
  justify-content: center;
`

export const listCss = css`
  position: relative;
  margin-right: 60px;
  min-width: 286px;

  h1 {
    font-size: 2.2rem;
  }
`

export const verticalListCss = css`
  margin-right: 0px;
  width: 100%;
`

export const anchorCss = css`
  position: fixed;
  inset-inline-end: 0;
  margin-inline-end: calc(20px - 100vw + 100%);
`

export const symmaryCss = css`
  text-align: center;
`

export const searchBtnCss = css`
  font-size: 1.2rem;
  padding: 1.2rem;
`

export const drawerAcitve = css`
  filter: blur(0.3rem);
`
