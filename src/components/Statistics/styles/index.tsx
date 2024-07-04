import { css } from '@emotion/react'

import { getStatCss } from 'src/styles/variables'

export const mainCss = css`
  padding: 20px;
  padding-bottom: 80px;
`

export const headerCss = css`
  margin-bottom: 20px;
  font-size: 1.4rem;
  color: #6b6868;
  padding: 10px 20px;

  .ant-picker {
    margin-left: 30px;
    margin-right: 20px;
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
