import { css } from '@emotion/react'

import {
  ANTD_SWITCH_CHECKED_BG,
  ANTD_SWITCH_CHECKED_HOVER_BG,
  getTransition,
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
    color: #213547;
    background-color: #fff;
    font-size: 16px;

    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .resta--hidden-scroll {
    overflow: hidden;
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
    /* background-color: #fff; */ // move it to root instead, otherwise the circle style of statistics will be gone
  }

  h1 {
    font-size: 3.2em;
    line-height: 1.1;
  }

  small {
    font-size: 0.8rem;
  }

  .ant-btn {
    &.ant-btn-primary {
      text-shadow: 0 0 5px #beb7b7;
    }

    &.ant-btn-default {
    }

    &.ant-btn-text {
      padding: 1.1rem;
      border-radius: 9999px;
      vertical-align: middle;

      &:not(:disabled):not(.ant-btn-disabled) {
        color: #404756;
        &:active,
        &:focus {
          color: #0a7ea4;
          background: #e6f7ff;
        }
      }
    }
  }

  .ant-picker-dropdown {
    .ant-picker-footer-extra:not(:last-child) {
      border-bottom: none;
    }
  }

  .ant-picker-ok,
  .ant-picker-now {
    .ant-btn-primary,
    .ant-picker-now-btn {
      padding: 1.1rem;
      border-radius: 9999px;
      vertical-align: middle;
      background: #ffffff;
      box-shadow: none;
      border: none;
      text-shadow: none;

      &:not(:disabled):not(.ant-btn-disabled) {
        color: #404756;
        &:hover {
          background: #23272f0d;
          box-shadow: none;
        }
        &:active,
        &:focus {
          color: #0a7ea4;
          background: #e6f7ff;
        }
      }
    }
  }

  .ant-picker-now {
    padding-block: 2px;
    .ant-picker-now-btn {
      padding: 0.7rem 1rem;
      vertical-align: middle;
    }
  }

  .ant-switch {
    transition: ${getTransition()};

    width: 80px;
    font-size: 1rem;
    height: 30px;
    line-height: 30px;
    vertical-align: text-top;

    .ant-switch-handle {
      top: 5px;
    }

    .ant-switch-inner {
      > span {
        font-size: 1rem !important;
      }
      .ant-switch-inner-unchecked {
        margin-top: -30px;
      }
    }

    &.ant-switch-checked {
      background: ${ANTD_SWITCH_CHECKED_BG};
      background-size: 200% auto;
      &:hover:not(.ant-switch-disabled) {
        background: ${ANTD_SWITCH_CHECKED_HOVER_BG};
      }
    }
    .ant-switch-inner {
      text-shadow: 0 0 10px #636060;
    }
  }

  .ant-drawer {
    & > .ant-drawer-content-wrapper {
      box-shadow:
        -6px 0 16px 0 transparent,
        -3px 0 6px -4px transparent,
        -9px 0 28px 8px rgba(0, 0, 0, 0.05);
    }

    .ant-drawer-mask {
      background: #ffffffca;
    }

    .ant-drawer-body {
      padding: 1rem;
    }

    .ant-drawer-header-title {
      flex-direction: row-reverse;
    }

    .ant-drawer-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .ant-modal {
    .ant-modal-confirm-content {
      font-size: 1rem;
    }
  }

  .ant-modal-root {
    .ant-modal-mask {
      background: #ffffffca;
    }
  }

  .ant-divider {
    margin: 8px 0;
  }

  .ant-input-affix-wrapper .ant-input-clear-icon {
    font-size: 1rem;
  }

  .ant-select .ant-select-clear {
    font-size: 1rem;
    margin-top: -8px;
  }

  .ant-notification {
    .ant-notification-notice-wrapper {
      .ant-notification-notice {
        &-success {
          .ant-notification-notice-progress {
            &::-webkit-progress-value {
              background: #52c41a;
            }
          }
        }
        &-error {
          .ant-notification-notice-progress {
            &::-webkit-progress-value {
              background: #ff4d4f;
            }
          }
        }
        &-warning {
          .ant-notification-notice-progress {
            &::-webkit-progress-value {
              background: #faad14;
            }
          }
        }
      }

      .ant-notification-notice-message {
        font-size: 1.12rem !important;
        font-weight: 500;
        line-height: 1.2;
        margin-bottom: 1rem;
      }

      .ant-notification-notice-description {
        font-size: 1rem !important;
        font-weight: normal;
        color: #444;

        small {
          margin-top: 10px;
          display: block;
        }
      }
    }
    &.ant-notification-topRight {
      .ant-notification-notice-wrapper {
        top: -20px;
        right: 32px;
      }
    }
  }

  .ant-float-btn {
    z-index: 1001;
  }

  .ant-float-btn-group {
    height: min-content;
  }

  @media (prefers-color-scheme: light) {
    :root {
      color: #213547;
      /* background-color: #ffffff; */
    }
    a:hover {
      color: #747bff;
    }
    button {
      background-color: #f9f9f9;
    }
  }

  @media (prefers-color-scheme: dark) {
    :root {
      color: #213547;
      /* background-color: #ffffff; */
    }
  }

  /* PWA: It targets only the app used with a system icon in all mode */
  @media (display-mode: standalone),
    (display-mode: fullscreen),
    (display-mode: minimal-ui) {
    * {
      user-select: none;
    }
    // stop browser-refreshing when scrolling down to bottom
    body {
      overscroll-behavior-y: contain;
    }
  }
`

export const primaryBtnBg = `linear-gradient(to right, #2bc0e4 0%, #eaecc6 51%, #2bc0e4 100%);
    background-size: 200% auto;
    border-radius: 10px;
  `

export const btnStyles = {
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
  // defaultBg: '#23272f0d',
  // defaultColor: '#404756',
  // defaultActiveColor: '#087ea4',
  // defaultHoverColor: '#087ea4',
  // defaultHoverBg: '#23272f0d',
  // defaultActiveBg: '#e6f7ff',
  // defaultBorderColor: 'transparent',
  textHoverBg: '#23272f0d',
}

export const antStyles = {
  Button: btnStyles,
}
