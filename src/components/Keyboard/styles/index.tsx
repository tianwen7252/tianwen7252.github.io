import { css } from '@emotion/react'
import * as cssPlugin from '@emotion/css'

import {
  TABLET,
  KEYBOARD_FONT_SIZE,
  KEYBOARD_FONT_LETTER_SPACINGZE,
  KEYBOARD_TAB_FONT_SIZE,
  KEYBOARD_BTN_FONT_SIZE,
  KEYBOARD_TOTAL_FONT_SIZE,
  KEYBOARD_TEXT_MIN_HEIGHT,
  KEYBOARD_TEXT_MEALS_HEIGHT,
  KEYBOARD_TAG_FONT_SIZE,
  getTransition,
  getCalcHeight,
} from 'src/styles/variables'
import { COLORS } from 'src/constants/defaults/memos'

const BTN_GAP = '10px'

export const keyboardCss = css`
  position: relative;
  overflow: hidden;
`

export const keyboardLeftCss = css`
  width: min-content;
  /* width: 40vw; */
  min-width: 60vw;
  min-height: ${getCalcHeight(22)};
  padding: 10px 20px;
  font-size: ${KEYBOARD_FONT_SIZE};
  letter-spacing: ${KEYBOARD_FONT_LETTER_SPACINGZE};

  .ant-divider {
    margin: 10px 0;
  }
`

export const modeCommondityCss = css`
  .ant-tabs {
    margin-top: 0;
  }
`

export const textAreaCss = css`
  margin-bottom: 20px;
  word-wrap: break-word;
  min-height: ${KEYBOARD_TEXT_MIN_HEIGHT};
  @media only screen and (max-device-width: 1180px) and (orientation: landscape) {
    min-height: ${TABLET.KEYBOARD_TEXT_MIN_HEIGHT};
  }
`

export const mealsCss = css`
  max-height: ${KEYBOARD_TEXT_MEALS_HEIGHT};

  @media only screen and (max-device-width: 1180px) and (orientation: landscape) {
    max-height: ${TABLET.KEYBOARD_TEXT_MEALS_HEIGHT};
  }

  overflow-y: auto;

  .ant-tag {
    font-size: 1rem;
    vertical-align: middle;
    line-height: inherit;
    margin-inline-end: 4px;
    cursor: pointer;
  }

  .ant-tag-close-icon {
    /* vertical-align: middle; */
    font-size: 1rem;
  }
`

export const totalCss = css`
  margin-top: 1rem;
  font-weight: 500;
  font-size: ${KEYBOARD_TOTAL_FONT_SIZE};
`

export const soupsCss = css`
  font-size: 1rem;
  vertical-align: middle;
`

export const numberBtnsCss = css`
  position: relative;
  padding-top: 8px;

  .ant-btn {
    font-size: 1.2rem;
  }
`

export const keyBoardModeCss = css`
  font-size: 1.5rem;
  width: min-content;
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

    > span:not(.ant-btn-icon) {
      padding: 5px;
    }
  }

  .ant-btn,
  .anticon {
    font-size: ${KEYBOARD_BTN_FONT_SIZE};
  }
`

export const deleteBtnCss = css`
  &.ant-btn {
    width: 5rem;
    height: 30px;
    padding: 0px;
    display: block;
    line-height: inherit;
    font-size: 1rem;
    border-radius: 4px;
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

export const memoCss = css`
  font-size: 1rem;
  margin: 10px 0;

  .ant-tag {
    font-size: ${KEYBOARD_TAG_FONT_SIZE};
    vertical-align: middle;
    border: 1px solid #ddd;
    margin-left: 4px;
    margin-right: 0;
    padding: 2px 6px;

    &.ant-tag-checkable:not(.ant-tag-checkable-checked):hover {
      color: #333;
    }

    &.ant-tag-checkable-checked {
      background-color: #333;

      &::after {
        position: absolute;
        content: '✔️';
        top: -18px;
        left: 40%;
        /* right: 50%; */
      }
    }
  }
`

export const memoTextCss = css`
  border-right: 1px solid rgba(5, 5, 5, 0.06);
  border-image: linear-gradient(to bottom, #fff, #999, #fff) 1 100%;
  padding-right: 6px;
`

export const submitBtnCss = css`
  height: 3.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  transition: ${getTransition()};
  background-size: 200% auto;
  border-radius: 10px;
`
export const updateBtnCss = css`
  background: linear-gradient(to right, rgb(201, 255, 191), rgb(255, 175, 189));
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

export const BTN_COLOR_MAP = {
  green: greenBtnCss,
  brown: brownBtnCss,
  purple: purpleBtnCss,
  indigo: indigoBtnCss,
}

const setMemoTagColor = (bgColor, color = '#fff') => {
  return css`
    &.ant-tag.ant-tag-checkable-checked {
      background-color: ${bgColor};
      color: ${color};
    }
  `
}

export const brownTagCss = setMemoTagColor(COLORS.brown)

export const purpleTagCss = setMemoTagColor(COLORS.purple)

export const blueTagCss = setMemoTagColor(COLORS.blue)

export const goldTagCss = setMemoTagColor(COLORS.gold)

export const redTagCss = setMemoTagColor(COLORS.red)

export const MEMO_COLOR_MAP = {
  brown: brownTagCss,
  purple: purpleTagCss,
  blue: blueTagCss,
  gold: goldTagCss,
  red: redTagCss,
}
