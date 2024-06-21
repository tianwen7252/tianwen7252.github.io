import { css } from '@emotion/react'

import { getCalcWidth, getCalcHeight } from 'src/styles/variables'

export const mainCss = css`
  position: relative;
  padding: 20px;
  /* width: ${getCalcWidth(40)}; */
  min-height: ${getCalcHeight(40)};
  label: _____main;

  [class*='__orderlist_summary'] {
    padding: 20px;
    border-radius: 20px;
    margin-right: 140px; // for anchor last item
    position: relative;

    .ant-statistic-title {
      font-size: 1rem;
    }
  }
`

export const headerCss = css`
  h2 {
    color: #bbb;
  }

  [class*='__orderlist_summary'] {
    padding-bottom: 0;
    width: 70%;
    margin: 0 auto;
    /* background: #ccc;
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      right: 0;
      background-repeat: repeat;
      height: 10px;
      background-size: 20px 20px;
      background-image: radial-gradient(
        circle at 10px -5px,
        transparent 12px,
        #fff 13px
      );
    } */
  }
`

export const orderListCss = css`
  overflow-x: hidden;
  overflow-y: auto;
  width: 100%;

  .ant-select,
  .ant-input-affix-wrapper {
    margin-bottom: 1rem;
  }

  // for anchor
  /* .ant-flex:empty {
    height: 1px;
    padding: 0;
    margin: 0;
    visibility: hidden;
  } */
`

export const drawerCss = css`
  position: relative;
`

export const contentCss = css`
  /* justify-content: center; */
`

export const sectionCss = css`
  > [class*='__orderlist_summary'] {
    width: 50%;
    background: #00000007;
    margin: 0;
  }
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
    margin: 40px 0;
  }
`

export const symmaryCss = css`
  text-align: center;
  label: __orderlist_summary; // @emotion only
`

export const verticalListCss = css`
  width: 100%;
  margin-right: 120px;
  margin-bottom: 140px; // for anchor last item
`

export const anchorCss = css`
  position: fixed;
  inset-inline-end: 0;
  margin-inline-end: calc(20px - 100vw + 100%);
`

export const searchBtnCss = css`
  font-size: 1.2rem;
  padding: 1.2rem;
`

export const drawerAcitve = css`
  filter: blur(0.3rem);
`

export const toggleTimeBtnCss = css`
  float: left;
  margin: 3px 0;
`
