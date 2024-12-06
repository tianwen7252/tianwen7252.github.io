import { css } from '@emotion/react'

import { getCalcWidth, getCalcHeight, getStatCss } from 'src/styles/variables'

export const mainCss = css`
  position: relative;
  padding: 20px;
  /* width: ${getCalcWidth(40)}; */
  min-height: ${getCalcHeight(40)};
  label: __main;

  [class*='__orderlist_summary'] {
    padding: 20px;
    border-radius: 20px;
    margin-right: 200px; // for anchor last item
    position: relative;

    .ant-statistic-title {
      font-size: 1rem;
    }
  }

  .resta-orderlist-search-drawer {
    .ant-drawer-content-wrapper {
      position: sticky;
      top: 60px;

      .ant-drawer-body {
        overflow-y: auto;
        > div {
          height: calc(100vh - 170px);
        }
      }
    }
  }
`

export const headerCss = css`
  padding: 10px 20px;
  h2 {
    color: #bbb;
  }
`

export const listSummaryCss = css`
  [class*='__orderlist_summary'] {
    padding-bottom: 0;
    width: 70%;
    margin-left: auto;

    .ant-statistic-title {
      border-bottom: 1px solid #d3cdcd;
      padding-bottom: 4px;
    }
  }
`

export const statWrapperCss = css`
  ${getStatCss({
    rtColor: '#b6cad8',
    rbColor: '#ebdcc0',
    lbColor: '#e7e2d5',
    ltColor: '#c0cfb9',
  })}
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

export const keyboardDrawerCss = css`
  .ant-drawer-content {
    overflow: hidden;
    height: auto;
  }

  .ant-drawer-close {
    margin-right: 50px;
  }
`

const ipadContent = css`
  padding-bottom: 280px;
`

export const contentCss = css`
  padding-bottom: 350px; // for anchor last item and scroll-top buttn

  @media only screen and (max-device-width: 1080px) and (orientation: landscape) {
    ${ipadContent}
  }
  @media only screen and (max-device-width: 1180px) and (orientation: landscape) {
    ${ipadContent}
  }
`

export const drawerAcitve = css`
  filter: blur(0.3rem);

  .ant-anchor-wrapper {
    display: none;
  }
`

export const sectionCss = css`
  > [class*='__orderlist_summary'] {
    width: 70%;
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

  .resta-orders-content {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
`

export const symmaryCss = css`
  text-align: center;
  label: __orderlist_summary; // @emotion only
`

export const horizontalListCss = css`
  width: 100%;
  margin-right: 140px;
`

export const anchorCss = css`
  position: fixed;
  inset-inline-end: 0;
  margin-inline-end: calc(20px - 100vw + 100%);
  margin-top: 10px;
`

export const searchBtnCss = css`
  font-size: 1.2rem;
  padding: 1.2rem;
  border: 1px solid #eee;
`

export const toggleTimeBtnCss = css`
  float: left;
  margin: 3px 0;
`
