import { css } from '@emotion/react'

import {
  ANTD_SWITCH_CHECKED_BG,
  ANTD_SWITCH_CHECKED_HOVER_BG,
} from './variables'

export const rootCss = css`
  * {
    margin: 0;
  }
  :root {
    font-family: -apple-system, BlinkMacSystemFont, Inter, 'Segoe UI', Roboto,
      'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
      'Segoe UI Emoji', 'Segoe UI Symbol';
    line-height: 1.5;
    font-weight: 400;

    color-scheme: light dark;
    color: rgba(255, 255, 255, 0.87);
    background-color: #242424;
    font-size: 16px;

    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    font-weight: 500;
    color: #646cff;
    text-decoration: inherit;

    &:hover {
      color: #535bf2;
    }
  }

  body {
    margin: 0;
    min-width: 320px;
    min-height: 100vh;
  }

  h1 {
    font-size: 3.2em;
    line-height: 1.1;
  }

  .ant-switch {
    &.ant-switch-checked {
      transition: 0.5s;
      background: ${ANTD_SWITCH_CHECKED_BG};
      background-size: 200% auto;
    }
    &:hover:not(.ant-switch-disabled) {
      background-position: right center;
    }
  }

  @media (prefers-color-scheme: light) {
    :root {
      color: #213547;
      background-color: #ffffff;
    }
    a:hover {
      color: #747bff;
    }
    button {
      background-color: #f9f9f9;
    }
  }
`

export const primaryBtnBg =
  'linear-gradient(to right, #2bc0e4 0%, #eaecc6 51%, #2bc0e4 100%)'

export const primaryBtnStyles = {
  primaryColor: '#fff',
  colorPrimary: primaryBtnBg,
  colorPrimaryHover: `'?';
    background-position: center;
    box-shadow: 0 0 20px #eee;
  `,
  colorPrimaryActive: `'?';
    background-position: center;
    box-shadow: 0 0 20px #eee;
  `,
}
