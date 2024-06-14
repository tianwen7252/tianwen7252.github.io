import { css } from '@emotion/react'

import { KEYBOARD_TAG_FONT_SIZE, KEYBOARD_DATE_FONT_SIZE } from 'src/styles'
import { COLORS } from 'src/constants/defaults/memos'

const actionUIWidth = 42 * 2 - 1 // - 1 border

export const orderCss = css`
  font-size: 1rem;
  margin-bottom: 10px;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid #555;
`

export const frameCss = css`
  &,
  .anticon {
    transition: transform 1s cubic-bezier(0.075, 0.82, 0.165, 1);
  }
  label: __order-frame; // @emotion only
`

export const mainCss = css`
  background: #fff;
  min-width: 284px;
  label: __order-main; // @emotion only

  .ant-divider {
    margin: 10px 0;
  }

  .ant-tag {
    font-size: ${KEYBOARD_TAG_FONT_SIZE};
    margin-inline-end: 0;
  }
`

export const numberCss = css`
  min-width: 40px;
  min-height: 30px;
  line-height: 30px;
  background: #222;
  color: #fff;
  text-align: center;
  border-radius: 0 0 8px 0;
  label: __order-number; // @emotion only
`

export const onEditCss = css`
  .css-${frameCss.name}, [class$='__order-frame'] {
    background: #8cc33b;
    transform: translateX(-${actionUIWidth}px);
  }

  .css-${mainCss.name}, [class$='__order-main'] {
    border-radius: 0 8px 8px 0;
    box-shadow: 0px 0px 10px #00000085;
    z-index: 1;
  }

  /* .css-${numberCss.name}, [class$='__order-number'] {
    left: ${actionUIWidth}px;
  } */
`

export const headerCss = css`
  display: flex;
  justify-content: space-between;
`

export const actionBtnCss = css`
  visibility: hidden;
  label: __order-action-btn; // @emotion only
  transition: all 0.5s ease-out;

  .anticon {
    cursor: pointer;
    margin: 8px;

    &:hover,
    &:active {
      transform: scale(1.5);
    }
  }
`

export const actionMoreBtnCss = css`
  font-size: 1.2rem;
`

export const cardCss = css`
  &:hover {
    .css-${actionBtnCss.name}, [class$='__order-action-btn'] {
      visibility: visible;
    }
  }
`

export const contentCss = css`
  padding: 10px;
`

export const operatorCss = css`
  margin-inline-start: 4px;
  margin-inline-end: 4px;
`

export const totalCss = css`
  font-weight: 500;
  text-align: right;
`
export const dateCss = css`
  font-size: ${KEYBOARD_DATE_FONT_SIZE};
  width: 100%;
  justify-content: flex-end;
`

export const actionCss = css`
  color: white;
  cursor: pointer;
`

export const actionStyle = `
  padding: 10px 1rem;
  justify-content: center;
  align-items: center;
  display: flex;
  width: 10px;
  &:hover, &:active {
    .anticon {
      transform: scale(1.5);
    }
  }
`

export const actionEditCss = css`
  ${actionStyle}
  background: #8cc33b;
`

export const actionDeleteCss = css`
  ${actionStyle}
  background: #ea5353;
`

const setBgColor = color => {
  return css`
    /* border-color: ${color}; */
    background: color-mix(in srgb, ${color} 8%, #fff);

    .css-${numberCss.name}, [class$='__order-number'] {
      background: ${color};
    }
  `
}

export const BG_COLOR_MAP = {
  gold: setBgColor(COLORS.gold),
  blue: setBgColor(COLORS.blue),
  purple: setBgColor(COLORS.purple),
  red: setBgColor(COLORS.red),
}
