import React, { useEffect, useRef } from 'react'
import { Flex, Statistic, Anchor } from 'antd'
import dayjs from 'dayjs'

import { Order } from 'src/components/Order'
import { WORK_SHIFT } from 'src/constants/defaults/workshift'
import * as styles from './styles'

const workShift = [...WORK_SHIFT].reverse()

export function useOrderList(
  orderRecord: Resta.OrderRecord,
  setAnchor = false,
) {
  let totalCount = 0
  let soldItemsCount = 0
  let orderListElement = null
  let periods = []
  if (orderRecord.length) {
    const dateToday = dayjs(orderRecord[0].timestamp)
      .hour(0)
      .minute(0)
      .second(0)
    const dateTodayString = dateToday.format('YYYY-MM-DD')
    periods = workShift.map(({ title, startTime, key }) => {
      const [hours, minutes] = startTime.split(':')
      return {
        title,
        id: `resta-anchor-${dateTodayString}-${key}`,
        timestamp: dateToday.hour(+hours).minute(+minutes).valueOf(),
        elements: [],
      }
    })
    orderRecord.forEach((record, index) => {
      const { data, total, timestamp } = record
      totalCount += total
      soldItemsCount += data.filter(({ res }) => !!res).length
      const element = (
        <Order
          key={timestamp}
          record={record}
          number={orderRecord.length - index}
        />
      )
      const result = periods.some(({ elements, timestamp: time }) => {
        if (timestamp >= time) {
          elements.push(element)
          return true
        }
        return false
      })
      // not found, put it to the last
      if (!result) {
        periods.at(-1).elements.push(element)
      }
    })
    orderListElement = (
      <Flex gap={8}>
        <div css={styles.listCss}>
          {periods.map(({ elements, id }) => {
            return (
              <div key={id} id={id}>
                {elements}
              </div>
            )
          })}
        </div>
        <Anchor
          css={styles.anchorCss}
          bounds={1}
          items={periods.map(({ id, title }) => ({
            key: id,
            href: `#${id}`,
            title,
          }))}
        />
      </Flex>
    )
  }
  const summaryElement = (
    <Flex css={styles.symmaryCss} justify="space-between">
      <Statistic title="訂單數量" value={orderRecord.length} />
      <Statistic title="銷售商品數量" value={soldItemsCount} />
      <Statistic title="營業額" prefix="$" value={totalCount} />
    </Flex>
  )

  // do we need this exact?
  const anchorRef = useRef(false)
  useEffect(() => {
    if (setAnchor && orderRecord.length && !anchorRef.current) {
      const now = dayjs().valueOf()
      periods.some(({ timestamp, id }) => {
        if (now >= timestamp) {
          location.hash = `#${id}`
          return true
        }
        return false
      })
      anchorRef.current = true
    }
  }, [anchorRef, setAnchor, periods, orderRecord])

  return {
    totalCount,
    soldItemsCount,
    orderListElement,
    summaryElement,
  }
}
