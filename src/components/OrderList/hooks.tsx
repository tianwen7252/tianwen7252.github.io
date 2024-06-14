import React, {
  useEffect,
  useRef,
  useContext,
  useMemo,
  useCallback,
} from 'react'
import { Flex, Statistic, Anchor } from 'antd'
import { useLiveQuery } from 'dexie-react-hooks'
import dayjs from 'dayjs'

import { AppContext } from 'src/components/App/context'
import { Order } from 'src/components/Order'
import { WORK_SHIFT } from 'src/constants/defaults/workshift'
import * as styles from './styles'

const workShift = [...WORK_SHIFT].reverse()

export function useOrderList(
  datetime: [string, string] | 'today',
  onAction?: Resta.Order.Props['onAction'],
  setAnchor = false,
) {
  let totalCount = 0
  let soldItemsCount = 0
  let orderListElement: JSX.Element = null
  // eslint-disable-next-line react-hooks/exhaustive-deps
  let periods = [] // needs always update-to-date
  const { db } = useContext(AppContext)
  const [startTime, endTime] = useMemo(() => {
    const today = dayjs()
    return datetime === 'today'
      ? [today.startOf('day').valueOf(), today.endOf('day').valueOf()]
      : datetime
  }, [datetime])
  const records = useLiveQuery(
    () => {
      return db.orders
        .where('timestamp')
        .between(startTime, endTime)
        .reverse()
        .sortBy('timestamp')
    },
    [datetime],
    [] as RestaDB.Table.Order[],
  )
  const handleAction = useCallback(
    async (
      record: RestaDB.OrderRecord,
      action: Resta.Order.ActionType,
      timestamp: RestaDB.OrderRecord['timestamp'],
    ) => {
      switch (action) {
        case 'edit': {
          if (!timestamp) {
            record.timestamp = dayjs().valueOf()
          }
          return db.orders.update(record.id, record as RestaDB.NewOrderRecord)
        }
        case 'delete': {
          return db.orders.delete(record.id)
        }
      }
    },
    [db],
  )
  if (records.length) {
    const theDate = dayjs(startTime)
    const dateTodayString = theDate.format('YYYY-MM-DD')
    periods = workShift.map(({ title, startTime, key }) => {
      const [hours, minutes] = startTime.split(':')
      return {
        title,
        id: `resta-anchor-${dateTodayString}-${key}`,
        timestamp: theDate.hour(+hours).minute(+minutes).valueOf(),
        elements: [],
      }
    })
    records.forEach((record, index) => {
      const { data, total, timestamp } = record
      totalCount += total
      soldItemsCount += data.filter(({ res }) => !!res).length
      const element = (
        <Order
          key={timestamp}
          record={record}
          number={records.length - index}
          onAction={onAction}
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
      <Statistic title="訂單數量" value={records.length} />
      <Statistic title="銷售商品數量" value={soldItemsCount} />
      <Statistic title="營業額" prefix="$" value={totalCount} />
    </Flex>
  )

  // do we need this exact?
  const anchorRef = useRef(false)
  useEffect(() => {
    if (setAnchor && records.length && !anchorRef.current) {
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
  }, [anchorRef, setAnchor, periods, records])

  return {
    totalCount,
    lastRecordNumber: records?.at?.(0)?.number || 0,
    soldItemsCount,
    orderListElement,
    summaryElement,
    handleAction,
  }
}
