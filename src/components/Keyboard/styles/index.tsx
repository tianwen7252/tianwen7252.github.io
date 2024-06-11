import { css } from '@emotion/react'
import * as cssPlugin from '@emotion/css'

import {
  HEADER_HEIGHT,
  KEYBOARD_FONT_SIZE,
  KEYBOARD_FONT_LETTER_SPACINGZE,
  KEYBOARD_TAB_FONT_SIZE,
} from 'src/styles'

const BTN_GAP = '10px'

export const keyboardCss = css`
  /* width: 40vw; */
  width: min-content;
  /* max-width: 40vw; */
  min-height: calc(100vh - ${HEADER_HEIGHT});
  padding: 20px;
  font-size: ${KEYBOARD_FONT_SIZE};
  letter-spacing: ${KEYBOARD_FONT_LETTER_SPACINGZE};
`

export const textAreaCss = css`
  min-height: 150px;
  /* max-height: 300px; */
  word-wrap: break-word;
  /* max-width: 400px; */
  margin-bottom: 20px;
`

export const mealsCss = css`
  /* display: inline-block; */

  .ant-tag {
    font-size: 1rem;
    vertical-align: middle;
    line-height: inherit;
    margin-inline-end: 4px;
    cursor: pointer;
  }

  .ant-tag-close-icon {
    vertical-align: middle;
  }
`

export const totalCss = css`
  margin-top: 20px;
  font-weight: 500;
`

export const numberBtnsCss = css`
  position: relative;
  padding-top: 8px;
`

export const btnCss = css`
  width: min-content;
  .ant-flex {
    margin-bottom: ${BTN_GAP};
    align-content: flex-start;
  }

  .ant-btn {
    width: 5rem;
    height: 5rem;
    white-space: normal;
    word-break: break-word;

    > span {
      padding: 5px;
    }
  }

  .ant-btn,
  .anticon {
    font-size: 18px;
  }
`

export const deleteBtnCss = css`
  &.ant-btn {
    position: absolute;
    right: 0;
    top: -55px;
    height: 2.6rem;
    padding: 0;
  }
`

export const tabCss = css`
  margin-top: calc(-${KEYBOARD_TAB_FONT_SIZE} - 50px);

  .ant-tabs-nav {
    margin-left: 10px;
    margin-bottom: 1.5rem;
  }

  .ant-tabs-tab + .ant-tabs-tab {
    margin: 0 0 0 2rem;
  }

  .ant-tabs-tab-btn {
    font-size: ${KEYBOARD_TAB_FONT_SIZE};
  }
`

export const tabPanelCss = css`
  font-size: 12px;
  flex-wrap: wrap;
  flex-direction: column;
  height: 350px;
  align-content: space-between;
  row-gap: ${BTN_GAP};
`

export const btnDropdownCssName = cssPlugin.css`
  color: red;

  .ant-dropdown-menu .ant-dropdown-menu-item {
    font-size: 1rem;
  }
`

export const drawerCssName = cssPlugin.css`
  .ant-drawer-body {
    padding: 1rem;
  }

  .ant-drawer-header-title {
    flex-direction: row-reverse;
  }
`

export const drawerSymmaryCss = css`
  text-align: center;
`

export const submitCss = css`
  height: 3.5rem;
  background-image: radial-gradient(
    circle at 10% 20%,
    rgb(130, 205, 221) 0%,
    rgb(255, 247, 153) 120%
  );
`

const setBtnColor = (border, color = border) => {
  return css`
    border-color: ${border};
    color: ${color};
  `
}

export const greenBtnCss = setBtnColor('#426e0680', '#426e06')

export const brownBtnCss = setBtnColor('#7e632280', '#7e6322')

export const purpleBtnCss = setBtnColor('#673e7678', '#673e76')

export const indigoBtnCss = setBtnColor('#3e667675', '#3e6676')

export const COLOR_MAP = {
  green: greenBtnCss,
  brown: brownBtnCss,
  purple: purpleBtnCss,
  indigo: indigoBtnCss,
}
