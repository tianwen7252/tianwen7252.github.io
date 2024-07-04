import { css } from '@emotion/react'

import { getStatCss } from 'src/styles/variables'

export const mainCss = css`
  padding: 20px;
`

export const headerCss = css`
  margin-bottom: 20px;
  font-size: 1.4rem;
  color: #6b6868;
  position: sticky;
  top: 0;
  z-index: 870;
  padding: 10px 20px;

  .ant-picker {
    margin-left: 30px;
    margin-right: 20px;
  }
  &.resta-header--active {
    backdrop-filter: blur(10px);
    box-shadow:
      0 0 #000,
      0 0 #0000,
      0 0 #000,
      0 0 #0000,
      0 16px 32px -16px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(0, 0, 0, 0.1);
  }
`

export const titleCss = css`
  vertical-align: middle;
`

export const summaryCss = css`
  .ant-flex {
    margin-bottom: 20px;
    justify-content: space-around;
  }

  .ant-statistic {
    text-align: center;
  }

  .ant-statistic-title {
    color: #858585;
    font-size: 1.1rem;
    border-bottom: 1px solid #d3cdcd;
    padding-bottom: 4px;
  }
`

export const statCss = css`
  ${getStatCss({
    rtColor: '#FBD28E',
    rbColor: '#B2E9E6',
    lbColor: '#FCD5C2', // c2effc
    ltColor: '#FFBBBA',
  })}
`
