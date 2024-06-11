import React from 'react'
import { Space } from 'antd'
import dayjs from 'dayjs'

import { toCurrency } from 'src/libs/common'
import * as styles from './styles'

export const Order: React.FC<{
  record: Resta.Order
  number: number
}> = props => {
  const { record, number } = props
  const { data, total, timestamp } = record
  return (
    <div css={styles.orderCss}>
      <div css={styles.mealsCss}>
        <div css={styles.numberCss}>{number}</div>
        {data.map((item, index) => {
          const { value, operator, type } = item
          let content
          if (operator) {
            content = (
              <span>
                <span css={styles.operatorCss}>{operator}</span>
                {value}
              </span>
            )
          } else {
            content = type ? (
              <span>
                {value} ({type})
              </span>
            ) : (
              value
            )
          }
          return <Space key={`${index}-${value}`}>{content}</Space>
        })}
      </div>
      {total && <div css={styles.totalCss}>金額 {toCurrency(total)}</div>}
      <Space css={styles.dateCss}>
        {dayjs(timestamp).format('YYYY/MM/DD h:m:s A')}
        <span>({dayjs(timestamp).fromNow()})</span>
      </Space>
    </div>
  )
}

export default Order
