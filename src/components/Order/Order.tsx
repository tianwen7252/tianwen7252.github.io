import React, { useMemo } from 'react'
import { Space, Divider, Tag } from 'antd'
import dayjs from 'dayjs'

import { toCurrency } from 'src/libs/common'
import {
  MEMOS_NAME_COLOR_MAP,
  HIGHLIGHT_MEMOS,
} from 'src/constants/defaults/memos'
import * as styles from './styles'

export const Order: React.FC<{
  record: Resta.Order
  number: number
}> = props => {
  const { record, number } = props
  const { data, total, memo, timestamp } = record
  const bgColor = useMemo(() => {
    let bgColor = ''
    if (Array.isArray(memo)) {
      memo.some(tag => {
        const has = HIGHLIGHT_MEMOS.includes(tag)
        if (has) {
          bgColor = MEMOS_NAME_COLOR_MAP[tag]
        }
        return has
      })
    }
    return bgColor
  }, [memo])

  return (
    <div css={[styles.orderCss, styles.BG_COLOR_MAP[bgColor]]}>
      <div css={styles.mealsCss}>
        <div css={styles.numberCss}>{number}</div>
        {data.map((item, index) => {
          const { value, operator, res } = item
          let content
          if (operator) {
            content = (
              <span>
                <span css={styles.operatorCss}>{operator}</span>
                {value}
              </span>
            )
          } else {
            content = res ? (
              <span>
                {value} ({res})
              </span>
            ) : (
              value
            )
          }
          return <Space key={`${index}-${value}`}>{content}</Space>
        })}
      </div>
      {memo && (
        <>
          <Divider />
          <Space wrap>
            {memo.map(name => (
              <Tag key={name}>{name}</Tag>
            ))}
          </Space>
        </>
      )}
      <Divider />
      {total && <div css={styles.totalCss}>金額 {toCurrency(total)}</div>}
      <Space css={styles.dateCss}>
        {dayjs(timestamp).format('YYYY/MM/DD h:m:s A')}
        <span>({dayjs(timestamp).fromNow()})</span>
      </Space>
    </div>
  )
}

export default Order
