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
  // KEYBOARD_DRAWER_TEXT_MIN_HEIGHT,
  getTransition,
  getCalcHeight,
  KEYBOARD_MODE_COMM_TAB_FONT_SIZE,
  KEYBOARD_MODE_COMM_BTN_FONT_SIZE,
} from 'src/styles/variables'
import { COLORS } from 'src/constants/defaults/orderTypes'

const BTN_GAP = '10px'

export const keyboardCss = css`
  position: relative;
  overflow: hidden;
  --resta-original-total-room: 0px;
`
export const keyboardHasEditedTotal = css`
  --resta-original-total-room: 38px;
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
    margin: 8px 0;
  }
`

export const modeCommondityCss = css`
  .ant-tabs {
    margin-top: 0;

    .ant-tabs-tab-btn {
      font-size: ${KEYBOARD_MODE_COMM_TAB_FONT_SIZE};
    }
  }
  .resta-keyboard-btn-area {
    .ant-btn {
      width: 5rem;
    }

    .ant-btn,
    .anticon {
      font-size: ${KEYBOARD_MODE_COMM_BTN_FONT_SIZE};
    }
  }
`

export const textAreaCss = css`
  margin-bottom: 20px;
  word-wrap: break-word;
  min-height: ${KEYBOARD_TEXT_MIN_HEIGHT};

  @media only screen and (min-device-width: 1080px) and (orientation: landscape) {
    min-height: ${TABLET.KEYBOARD_TEXT_MIN_HEIGHT};
  }
  @media only screen and (min-device-width: 1280px) and (orientation: landscape) {
    min-height: ${KEYBOARD_TEXT_MIN_HEIGHT};
  }
`

export const drawerModeCss = css`
  margin-bottom: -20px;
  margin-top: -10px;

  .resta-keyboard-left {
    min-width: 70vw;
    min-height: ${getCalcHeight(22 + 90)};
  }

  /* @media only screen and (max-device-width: 1180px) and (orientation: landscape) {
    // transform: scale(0.93);
    // margin-left: -40px;
    // margin-top: -45px;
    margin-bottom: -20px;
    margin-top: -10px;
  } */
  .resta-keyboard-textArea {
    @media only screen and (min-device-width: 1080px) and (orientation: landscape) {
      min-height: calc(${TABLET.KEYBOARD_TEXT_MEALS_HEIGHT} + 20px);
      max-height: calc(${TABLET.KEYBOARD_TEXT_MEALS_HEIGHT} + 20px);
    }
    @media only screen and (min-device-width: 1280px) and (orientation: landscape) {
      max-height: none;
    }
  }
`

export const mealsCss = css`
  max-height: calc(
    ${KEYBOARD_TEXT_MEALS_HEIGHT} - var(--resta-original-total-room)
  );

  @media only screen and (min-device-width: 1080px) and (orientation: landscape) {
    max-height: calc(
      ${TABLET.KEYBOARD_TEXT_MEALS_HEIGHT} - var(--resta-original-total-room)
    );
  }
  @media only screen and (min-device-width: 1280px) and (orientation: landscape) {
    max-height: calc(
      ${KEYBOARD_TEXT_MEALS_HEIGHT} - var(--resta-original-total-room)
    );
  }

  overflow-y: auto;

  .ant-tag {
    font-size: 1rem;
    vertical-align: text-bottom;
    line-height: inherit;
    margin-inline-end: 4px;
    cursor: pointer;
    background: #fff;
    border: 1px solid #2222229c;
    color: #2222229c;
  }

  .ant-tag-close-icon {
    /* vertical-align: middle; */
    font-size: 1rem;
    color: #2222229c;
  }
`

export const totalCss = css`
  margin-top: 1rem;
  font-weight: 500;
  font-size: ${KEYBOARD_TOTAL_FONT_SIZE};
`

export const originalTotalCss = css`
  color: #aaa;
  text-decoration: line-through;
`

export const editedTotalCss = css`
  margin-top: 0;
`

export const soupsCss = css`
  font-size: 1rem;
  vertical-align: middle;
`

export const changePanelCss = css``

export const changeCss = css`
  color: #fff;
  padding: 2px 4px;
  border-radius: 4px;
  letter-spacing: 0;
  font-size: 1rem;
  margin-right: 8px;

  &.resta-keyboard-change-1000 {
    background: #3f6ab0;
  }
  &.resta-keyboard-change-500 {
    background: #ae917d;
  }
  &.resta-keyboard-change-100 {
    background: #f38590;
  }
`

export const numberBtnsCss = css`
  position: relative;
  padding-top: 8px;

  .ant-btn {
    font-size: 1.2rem;
  }
`

export const orderPageModeCss = css`
  font-size: 1.5rem;
  width: min-content;
`

export const btnAreaCss = css`
  flex: auto;
  justify-content: end;
`

export const btnCss = css`
  width: min-content;
  gap: 20px;

  // for ipad 11 air
  @media only screen and (min-device-width: 1180px) and (max-height: 796px) and (orientation: landscape) {
    gap: 70px;
  }

  .ant-flex {
    margin-bottom: ${BTN_GAP};
    align-content: space-between;
  }

  .ant-btn {
    width: 4.2rem;
    height: 4.2rem;
    white-space: normal;
    word-break: break-word;
    padding: 0;
    /* transform: scale(0.9); */

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

    .ant-btn-icon {
      vertical-align: middle;
      margin-right: 4px;
      margin-top: -2px;
    }
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
    // for iPad 10
    @media only screen and (max-device-width: 1080px) and (orientation: landscape) {
      margin: 0 0 0 1rem;
    }
  }

  .ant-tabs-tab-btn {
    font-size: ${KEYBOARD_TAB_FONT_SIZE};
  }
`

export const tabPanelCss = css`
  font-size: 12px;
  flex-wrap: wrap;
  flex-direction: column;
  min-height: 300px;
  max-height: 350px;
  align-content: space-between;
  row-gap: ${BTN_GAP};
`

export const btnDropdownCssName = cssPlugin.css`
  color: red;

  .ant-dropdown-menu .ant-dropdown-menu-item {
    font-size: 1rem;
  }
`

const orderTypeTagCommonCss = css`
  display: block;
  padding: 2px;
  position: absolute;
  top: -22px;
  color: #777;
  font-size: 0.8rem;
  background: #fff;
`

export const orderTypesCss = css`
  font-size: 1rem;
  padding: 5px 0;
  position: relative;

  &:before {
    content: '餐點備註';
    left: 0;
    ${orderTypeTagCommonCss}
  }

  &:after {
    content: '訂單備註';
    right: 0;
    ${orderTypeTagCommonCss}
  }

  .ant-tag {
    font-size: ${KEYBOARD_TAG_FONT_SIZE};
    vertical-align: middle;
    border: 1px solid #ddd;
    margin-right: 0;
    padding: 2px 6px;
    letter-spacing: 2px;
    margin-left: 2px;

    */ &.ant-tag-checkable:not(.ant-tag-checkable-checked):hover {
      color: #333;
    }

    &.ant-tag-checkable-checked {
      background-color: #333;

      &::after {
        position: absolute;
        content: '✔️';
        top: -18px;
        left: 40%;
        z-index: 1;
        /* right: 50%; */
      }
    }
  }
`

export const orderTypesBarCss = css`
  width: 100%;
  justify-content: space-between;
`

export const verticalBarCss = css`
  border-right: 1px solid rgba(5, 5, 5, 0.06);
  border-image: linear-gradient(to bottom, #fff, #999, #fff) 1 100%;
  margin: 0 2px;
  height: 26px;
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

export const editTotalFormCss = css`
  margin-top: 20px;
  .ant-form-item-row .ant-form-item-label > label {
    font-size: 1rem;
  }
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

const setOrderTypeTagColor = (bgColor, color = '#fff') => {
  return css`
    &.ant-tag.ant-tag-checkable-checked {
      background-color: ${bgColor};
      color: ${color};
    }
  `
}

export const brownTagCss = setOrderTypeTagColor(COLORS.brown)

export const purpleTagCss = setOrderTypeTagColor(COLORS.purple)

export const blueTagCss = setOrderTypeTagColor(COLORS.blue)

export const goldTagCss = setOrderTypeTagColor(COLORS.gold)

export const redTagCss = setOrderTypeTagColor(COLORS.red)

export const ORDER_TYPES_COLOR_MAP = {
  brown: brownTagCss,
  purple: purpleTagCss,
  blue: blueTagCss,
  gold: goldTagCss,
  red: redTagCss,
}
