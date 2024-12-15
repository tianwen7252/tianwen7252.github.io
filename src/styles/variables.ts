export const TABLET = {
  KEYBOARD_TEXT_MEALS_HEIGHT: '190px',
  KEYBOARD_TEXT_MIN_HEIGHT: '250px',
  ORDER_CARD_WIDTH: '260px',
  // KEYBOARD_DRAWER_TEXT_MIN_HEIGHT: '80px',
}

export const ANTD_SWITCH_CHECKED_BG =
  'linear-gradient(to right, #33ceea 0%, #ffd194  51%, #33ceea  100%)'
export const ANTD_SWITCH_CHECKED_HOVER_BG =
  'radial-gradient(circle, #ffd194 0%, #33ceea 100%);'

// export const HEADER_HEIGHT = '64px'
export const HEADER_HEIGHT = '0px'

export const KEYBOARD_FONT_SIZE = '1.5rem'
export const KEYBOARD_TOTAL_FONT_SIZE = '2rem'
export const KEYBOARD_FONT_LETTER_SPACINGZE = '.2rem'
export const KEYBOARD_TAG_FONT_SIZE = '.9rem'
export const KEYBOARD_DATE_FONT_SIZE = '.85rem'
export const KEYBOARD_TAB_FONT_SIZE = '1rem'
export const KEYBOARD_BTN_FONT_SIZE = '1.1rem'
export const KEYBOARD_TEXT_MIN_HEIGHT = '250px'
export const KEYBOARD_TEXT_MEALS_HEIGHT = '190px'
// export const KEYBOARD_DRAWER_TEXT_MIN_HEIGHT = '190px'
export const ORDER_CARD_WIDTH = '284px'

export function getTransition(target = 'all', second = 1) {
  return `${target} ${second}s cubic-bezier(0.075, 0.82, 0.165, 1)`
}

export function getCalcWidth(offset = 0) {
  return `calc(100vw - ${offset}px);`
}

export function getCalcHeight(offset = 0) {
  return `calc(100vh - ${offset}px - ${HEADER_HEIGHT});`
}

export function getStatCss(
  config = {} as {
    width?: string
    height?: string
    innerWidth?: string
    innerHeight?: string
    rtColor?: string
    rbColor?: string
    lbColor?: string
    ltColor?: string
  },
) {
  const {
    width = '200px',
    height = '200px',
    innerWidth = '150px',
    innerHeight = '150px',
    rtColor = '#F4D8DD',
    rbColor = '#C9DDE7',
    lbColor = '#F3EFE6',
    ltColor = '#D5EAE5',
  } = config
  return `
    width: ${width};
    height: ${height};
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;
    position: relative;
    &::before {
      content: '';
      position: absolute;
      left: 0;
      width: ${width};
      height: ${height};
      border-radius: 50%;
      z-index: -1;
      background: radial-Gradient(
          circle at calc(50% + (50% - 0.625em) * 1)
            calc(50% + (50% - 0.625em) * 0),
          ${rtColor} calc(0.625em - 1px),
          transparent 0.625em
        ),
        radial-Gradient(
          circle at calc(50% + (50% - 0.625em) * 0)
            calc(50% + (50% - 0.625em) * 1),
          ${rbColor} calc(0.625em - 1px),
          transparent 0.625em
        ),
        radial-Gradient(
          circle at calc(50% + (50% - 0.625em) * -1)
            calc(50% + (50% - 0.625em) * 0),
          ${lbColor} calc(0.625em - 1px),
          transparent 0.625em
        ),
        radial-Gradient(
          circle at calc(50% + (50% - 0.625em) * 0)
            calc(50% + (50% - 0.625em) * -1),
          ${ltColor} calc(0.625em - 1px),
          transparent 0.625em
        ),
        conic-Gradient(
          ${rtColor} 0% 90deg,
          ${rbColor} 0% 180deg,
          ${lbColor} 0% 270deg,
          ${ltColor} 0% 360deg
        );
      background-origin: border-box;
      mask: radial-Gradient(
        closest-side,
        red calc(100% - 1.25em - 0.75em - 1px),
        transparent calc(100% - 1.25em - 0.75em) calc(100% - 1.25em),
        red calc(100% - 1.25em + 1px) calc(100% - 1px),
        transparent
      );
    }
    .ant-statistic {
      background-color: #fff;
      border-radius: 50%;
      margin: auto;
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      width: ${innerWidth};
      height: ${innerHeight};
      justify-content: center;
    }
  `
}
