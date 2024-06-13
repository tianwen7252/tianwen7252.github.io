import { css } from '@emotion/react'

import { KEYBOARD_TAG_FONT_SIZE, KEYBOARD_DATE_FONT_SIZE } from 'src/styles'
import { COLORS } from 'src/constants/defaults/memos'

export const orderCss = css`
  font-size: 1rem;
  padding: 10px;
  padding-top: 40px;
  border: 1px solid #555;
  margin-bottom: 10px;
  border-radius: 4px;
  position: relative;
  overflow: hidden;

  .ant-divider {
    margin: 10px 0;
  }

  .ant-tag {
    font-size: ${KEYBOARD_TAG_FONT_SIZE};
    margin-inline-end: 0;
  }
`

export const numberCss = css`
  position: absolute;
  left: 0;
  top: 0;
  min-width: 40px;
  min-height: 30px;
  line-height: 30px;
  background: #222;
  color: #fff;
  text-align: center;
  border-radius: 0 0 8px 0;
  label: __order-number; // @emotion only
`

export const mealsCss = css`
  margin-bottom: 10px;

  .ant-tag {
    font-size: 1rem;
    vertical-align: middle;
    margin-inline-end: 4px;
  }

  .ant-tag-close-icon {
    vertical-align: middle;
  }
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

const setBgColor = color => {
  return css`
    border: 1px solid ${color};
    background: color-mix(in srgb, ${color} 5%, transparent);

    // this works as well
    /* [class$='__order-number'] {
      background: ${color};
    } */

    .css-${numberCss.name} {
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
