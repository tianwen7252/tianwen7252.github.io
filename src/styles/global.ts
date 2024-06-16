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

  small {
    font-size: 0.8rem;
  }

  .ant-btn-primary {
    text-shadow: 0 0 5px #beb7b7;
  }

  .ant-switch {
    transition: ${getTransition()};

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
  }

  .ant-modal {
    .ant-modal-confirm-content {
      font-size: 1rem;
    }
  }

  .ant-divider {
    margin: 10px 0;
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

export const primaryBtnBg = `linear-gradient(to right, #2bc0e4 0%, #eaecc6 51%, #2bc0e4 100%);
    background-size: 200% auto;
    border-radius: 10px;
  `

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
