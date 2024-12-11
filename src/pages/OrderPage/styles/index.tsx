import { css } from '@emotion/react'

import { ORDER_CARD_WIDTH } from 'src/styles'

export const orderPageCss = css`
  position: relative;
  overflow: hidden;

  .resta-order-card {
    // for iPad 10
    @media only screen and (max-device-width: 1080px) and (orientation: landscape) {
      --resta-order-card-width: ${ORDER_CARD_WIDTH};
    }
  }

  .ant-drawer {
    .ant-drawer-header {
      background: radial-gradient(
        circle at 10% 20%,
        #cef5e6 42%,
        #c0e9f9 93.6%
      );
    }
  }
`

export const drawerCss = css`
  position: relative;
`
