import { css } from '@emotion/react'

import { KEYBOARD_TAG_FONT_SIZE, KEYBOARD_DATE_FONT_SIZE } from 'src/styles'
import { COLORS } from 'src/constants/defaults/memos'

const actionUIWidth = 42 * 2 - 1 // - 1 border
const editBgColor = 'linear-gradient(to top, #dbd5a7, #b0dab9)'
const deleteBgColor = 'linear-gradient(to bottom, #fb578e, #f7bb97)'

export const orderCss = css`
  --resta-order-card-width: 284px;
  font-size: 1rem;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #55555587;
  width: var(--resta-order-card-width);
  min-width: var(--resta-order-card-width);

  // for iPad 10
  @media only screen and (max-device-width: 1080px) and (orientation: landscape) {
    --resta-order-card-width: 260px;
  }
`

export const frameCss = css`
  height: 100%;
  &,
  .anticon {
    transition: transform 1s cubic-bezier(0.075, 0.82, 0.165, 1);
  }
  label: __order-frame; // @emotion only
`

export const mainCss = css`
  background: #fff;
  min-width: var(--resta-order-card-width);
  label: __order-main; // @emotion only

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
    background: ${editBgColor};
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
  height: 100%;
  &:hover {
    .css-${actionBtnCss.name}, [class$='__order-action-btn'] {
      visibility: visible;
    }
  }
`

export const contentCss = css`
  padding: 10px;
  flex: 1;
`

export const footerCss = css`
  padding: 10px;
  align-self: flex-end;
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

export const dateUpdatedCss = css`
  color: #619b6d;
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
  background: ${editBgColor};
`

export const actionDeleteCss = css`
  ${actionStyle}
  background: ${deleteBgColor};
`

const setBgColor = color => {
  return css`
    background: ${color};
    background: linear-gradient(
      to bottom,
      color-mix(in srgb, ${color} 10%, #fff),
      #fff
    );

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
