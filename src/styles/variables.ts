export const TABLET = {
  KEYBOARD_TEXT_MEALS_HEIGHT: '88px',
  KEYBOARD_TEXT_MIN_HEIGHT: '140px',
}

export const ANTD_SWITCH_CHECKED_BG =
  'linear-gradient(to right, #33ceea 0%, #ffd194  51%, #33ceea  100%)'
export const ANTD_SWITCH_CHECKED_HOVER_BG = '#33ceea'

export const HEADER_HEIGHT = '64px'

export const KEYBOARD_FONT_SIZE = '1.5rem'
export const KEYBOARD_TOTAL_FONT_SIZE = '2rem'
export const KEYBOARD_FONT_LETTER_SPACINGZE = '.2rem'
export const KEYBOARD_TAG_FONT_SIZE = '.8rem'
export const KEYBOARD_DATE_FONT_SIZE = '.8rem'
export const KEYBOARD_TAB_FONT_SIZE = '1rem'
export const KEYBOARD_BTN_FONT_SIZE = '1rem'
export const KEYBOARD_TEXT_MIN_HEIGHT = '250px'
export const KEYBOARD_TEXT_MEALS_HEIGHT = '190px'

export function getTransition(target = 'all', second = 1) {
  return `${target} ${second}s cubic-bezier(0.075, 0.82, 0.165, 1)`
}
