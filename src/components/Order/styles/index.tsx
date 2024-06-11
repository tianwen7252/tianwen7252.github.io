import { css } from '@emotion/react'

export const orderCss = css`
  font-size: 1rem;
  padding: 10px;
  padding-top: 40px;
  border: 1px solid #555;
  margin-bottom: 10px;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
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
`

export const mealsCss = css`
  margin-bottom: 6px;

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
  font-size: 0.8rem;
  width: 100%;
  justify-content: flex-end;
`
