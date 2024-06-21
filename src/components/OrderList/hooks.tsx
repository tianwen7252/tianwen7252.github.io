import React, {
  useContext,
  useMemo,
  useCallback,
  useRef,
  useState,
} from 'react'
import {
  Flex,
  Statistic,
  Anchor,
  notification,
  Modal,
  Divider,
  Select,
  Skeleton,
  Empty,
} from 'antd'
import type { AnchorProps } from 'antd'
import { useLiveQuery } from 'dexie-react-hooks'
import dayjs from 'dayjs'
import { debounce } from 'lodash'

import { AppContext } from 'src/components/App/context'
import { Order } from 'src/components/Order'
import { WORK_SHIFT_REVERSED } from 'src/constants/defaults/workshift'
import { MEMO_OPTIONS } from 'src/constants/defaults/memos'
import { getCorrectAmount, DATE_FORMAT } from 'src/libs/common'
import * as styles from './styles'

const errMsgMap = {
  add: '新增訂單失敗',
  edit: '編輯訂單失敗',
  delete: '刪除訂單失敗',
}

const allSummaryText = ['期間總訂單數量', '期間總銷售商品數量', '期間總營業額']

const summaryText = [
  '訂單數量',
  '銷售商品數量',
  '總營業額',
  '上午營業額',
  '下午營業額',
]

function setPeriodMap(periodMap: Resta.OrderList.PeriodMap, createAt: number) {
  const theDate = dayjs.tz(createAt)
  const dateString = theDate.format('YYYY-MM-DD')
  periodMap[dateString] = periodMap[dateString] ?? {
    periods: WORK_SHIFT_REVERSED.map(
      ({ title, startTime: workStartTime, key, color }) => {
        const [hours, minutes] = workStartTime.split(':')
        return {
          title,
          id: `resta-anchor-${dateString}-${key}`,
          createdAt: theDate.hour(+hours).minute(+minutes).valueOf(),
          elements: [],
          color,
          total: 0,
        }
      },
    ),
    soldCount: 0,
    recordCount: 0,
    datetime: createAt, // usinng the first one is enough
    dateWithWeek: theDate.format(DATE_FORMAT),
  }
  const periodData = periodMap[dateString]
  return {
    periodData,
    periods: periodData.periods,
  }
}

function getPeriodsOrder(periodMap: Resta.OrderList.PeriodMap, desc = true) {
  return Object.keys(periodMap).sort((a, b) => {
    return desc ? b.localeCompare(a) : a.localeCompare(b)
  })
}

export function useOrderList({
  datetime,
  searchData,
  dateOrder = true, // true is desc date order
  searchUI = true,
  reverse = true,
  keyboardMode = false,
  vertical = keyboardMode,
  emptyDescription,
  handleRecords,
  search,
}: {
  datetime: number[] | 'today'
  searchData?: string[]
  dateOrder?: boolean
  searchUI?: boolean
  reverse?: boolean
  vertical?: boolean
  keyboardMode?: boolean
  emptyDescription?: React.ReactNode
  handleRecords?: Resta.OrderList.HandleRecords
  search?: Resta.API.Orders.SearchCallback
}) {
  let totalCount = 0
  let soldItemsCount = 0
  let orderListElement: JSX.Element = null
  let anchorElement: JSX.Element = null
  let summaryElement: JSX.Element = null
  datetime = datetime ?? 'today'
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const periodMap = {} as Resta.OrderList.PeriodMap // needs always update-to-date
  let periodsOrder = [] as string[]
  const { API } = useContext(AppContext)
  const [noti, contextHolder] = notification.useNotification()
  const [modal, modelContextHolder] = Modal.useModal()
  const [startTime, endTime] = useMemo(() => {
    const today = dayjs.tz()
    return datetime === 'today'
      ? [today.startOf('day').valueOf(), today.endOf('day').valueOf()]
      : datetime
  }, [datetime])
  const contentRef = useRef<HTMLDivElement>()
  const [searchText, setSearchText] = useState<string[]>([])
  const onSearch = useCallback(
    debounce((value: typeof searchText) => {
      setSearchText(value)
    }, 500),
    [],
  )
  // get db dtata
  const records = useLiveQuery(async () => {
    const list = await API.orders.get({
      startTime,
      endTime,
      reverse,
      searchText: searchData ?? searchText,
      search,
    })
    return handleRecords?.(list) ?? list
  }, [startTime, endTime, searchData, searchText, handleRecords, search])
  const anchorKeyToUpdate = useRef(1)
  const getAnchorContainer = useCallback(() => {
    // not working well...
    return contentRef.current
  }, [])
  const openNotification = useCallback(
    ({
      type,
      message = '系統通知',
      description,
      errorDescription,
      errorMsg,
    }: {
      type: Resta.NotificationType
      message?: React.ReactNode
      description?: React.ReactNode
      errorDescription?: React.ReactNode
      errorMsg?: string
    }) => {
      noti[type]({
        message,
        description: errorDescription ? (
          <>
            <p>{errorDescription}</p>
            <p>
              <small>錯誤代碼 - {errorMsg ?? 'Unknown'}</small>
            </p>
          </>
        ) : (
          description
        ),
        showProgress: true,
        pauseOnHover: type !== 'success',
        duration: type === 'success' ? 3 : 20,
      })
    },
    [noti],
  )
  const callOrderAPI: Resta.Order.Props['callOrderAPI'] = useCallback(
    async (record, action) => {
      try {
        switch (action) {
          case 'add': {
            const result = await API.orders.add(record)
            openNotification({
              type: 'success',
              description: '新增訂單成功!',
            })
            return result
          }
          case 'edit': {
            const result = await API.orders.set(
              record.id,
              record as RestaDB.NewOrderRecord,
            )
            openNotification({
              type: 'success',
              description: `編輯訂單[${record.number}]成功!`,
            })
            return result
          }
          case 'delete': {
            return new Promise(resolve => {
              modal.confirm({
                title: '你知道你正在做什麼嗎',
                content: (
                  <>
                    <p>確定要刪除訂單[{record.number}]?</p>
                    <Divider />
                  </>
                ),
                okType: 'danger',
                okText: '不要吵給我刪掉',
                cancelText: '取消，我不小心按到',
                onOk: close => {
                  API.orders.delete(record.id)
                  openNotification({
                    type: 'success',
                    description: `刪除訂單[${record.number}]成功!`,
                  })
                  close()
                  resolve(record.id)
                },
                onCancel: () => {
                  resolve(null)
                },
                footer: (_, { OkBtn, CancelBtn }) => (
                  <>
                    <OkBtn />
                    <CancelBtn />
                  </>
                ),
              })
            })
          }
        }
      } catch (err) {
        openNotification({
          type: 'error',
          message: '系統發生錯誤',
          errorDescription:
            action === 'add'
              ? errMsgMap[action]
              : `${errMsgMap[action]} - 訂單編號[${record.number}]`,
          errorMsg: err?.message,
        })
      } finally {
        setTimeout(() => {
          ++anchorKeyToUpdate.current
        }, 5)
      }
      return null
    },
    [API, modal, openNotification],
  )

  const recordLength = records?.length
  if (recordLength || searchText.length) {
    const searchResultNotFound = recordLength === 0 && searchText.length
    records?.forEach(record => {
      const { data, total, createdAt, number } = record
      const { periodData, periods } = setPeriodMap(periodMap, createdAt)
      totalCount += total
      ++periodData.recordCount
      data.forEach(({ res, amount }) => {
        if (res) {
          const soldCount = getCorrectAmount(amount)
          soldItemsCount += soldCount
          periodData.soldCount += soldCount
        }
      })
      const element = (
        <Order
          key={createdAt}
          record={record}
          number={number}
          callOrderAPI={callOrderAPI}
        />
      )
      const result = periods.some(period => {
        const { elements, createdAt: time } = period
        if (createdAt >= time) {
          period.total += total
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
    let anchorItems = [] as AnchorProps['items']
    periodsOrder = getPeriodsOrder(periodMap, dateOrder)
    const periodElements = periodsOrder.map(date => {
      const dateId = `resta-anchor-${date}`
      anchorItems.push({
        key: date,
        href: `#${dateId}`,
        title: date,
        children: [],
      })
      const { periods, dateWithWeek } = periodMap[date]
      !keyboardMode && periods.reverse()
      const orderElements = periods
        .filter(({ elements }) => (keyboardMode ? true : elements.length))
        .map(({ elements, id, color, title }) => {
          const style = keyboardMode
            ? null
            : {
                backgroundColor: color,
              }
          anchorItems.at(-1).children.push({
            key: id,
            href: `#${id}`,
            title,
          })
          return (
            <Flex
              css={!keyboardMode && styles.panelCss}
              key={id}
              id={id}
              data-title={title}
              vertical={vertical}
              gap={10}
              wrap
              style={style}
            >
              {elements}
            </Flex>
          )
        })
      if (keyboardMode) {
        anchorItems = anchorItems[0].children
        return orderElements
      }

      const { recordCount, soldCount } = periodMap[date]
      console.log('periodMap', periodMap)
      const morningSum = Math.round(periods[0].total)
      const afternoonSum = Math.round(periods[1].total)
      const daysSum = morningSum + afternoonSum
      return (
        <section css={styles.sectionCss} key={date}>
          <h1 id={dateId}>{dateWithWeek}</h1>
          <Flex css={styles.symmaryCss} justify="space-between">
            <Statistic title={summaryText[0]} value={recordCount} />
            <Statistic title={summaryText[1]} value={soldCount} />
            <Statistic title={summaryText[3]} prefix="$" value={morningSum} />
            <Statistic title={summaryText[4]} prefix="$" value={afternoonSum} />
            <Statistic title={summaryText[2]} prefix="$" value={daysSum} />
          </Flex>
          {orderElements}
        </section>
      )
    })
    if (!searchResultNotFound) {
      const anchorProps = keyboardMode
        ? {
            getContainer: getAnchorContainer,
            // offset + searchbox height + searchbox margin-bottom
            // bounds: 20 + 32 + 16,
            bounds: 200,
            getCurrentAnchor: activeLink => {
              // if afternoon is empty
              console.log(
                'activeLink',
                activeLink,
                periodMap[periodsOrder[0]].periods[0].elements.length,
                anchorItems.at(-1)?.href,
              )
              if (!periodMap[periodsOrder[0]].periods[0].elements.length) {
                console.log('activeLink123', activeLink)
                return anchorItems.at(-1)?.href
              }
              return activeLink
            },
          }
        : {
            offsetTop: 64,
            targetOffset: 100,
            bounds: 220, // 100
          }
      anchorElement = (
        <Anchor
          css={styles.anchorCss}
          key={anchorKeyToUpdate.current}
          items={anchorItems}
          {...anchorProps}
        />
      )
    }

    orderListElement = (
      <Flex css={styles.orderListCss} gap={8} ref={contentRef}>
        <div css={[styles.listCss, !vertical && styles.horizontalListCss]}>
          {searchUI && (
            <Select
              placeholder="找什麼呢?"
              mode="tags"
              style={{ width: '100%' }}
              allowClear
              onChange={onSearch}
              onKeyUp={event => {
                event.preventDefault()
                event.stopPropagation()
              }}
              options={MEMO_OPTIONS}
            />
          )}
          {searchResultNotFound ? (
            <Empty description="查無資料" />
          ) : (
            <>
              <div className="resta-orders-content">{periodElements}</div>
            </>
          )}
        </div>
        {keyboardMode && anchorElement}
      </Flex>
    )

    totalCount = Math.round(totalCount)
    const onePeriod = periodsOrder.length === 1
    const summaryDesc = onePeriod ? summaryText : allSummaryText
    summaryElement =
      !keyboardMode && onePeriod ? null : (
        <Flex css={styles.symmaryCss} justify="space-between">
          <Statistic title={summaryDesc[0]} value={recordLength ?? 0} />
          <Statistic title={summaryDesc[1]} value={soldItemsCount} />
          <Statistic title={summaryDesc[2]} prefix="$" value={totalCount} />
        </Flex>
      )
  } else if (recordLength === 0) {
    orderListElement = (
      <Flex css={styles.emptyCss}>
        <Empty description={emptyDescription || '查無資料'} />
      </Flex>
    )
  } else {
    // loading
    orderListElement = <Skeleton active />
  }

  return {
    recordLength,
    totalCount,
    lastRecordNumber: records?.at?.(0)?.number || 0,
    soldItemsCount,
    periodsOrder,
    orderListElement: (
      <>
        {contextHolder}
        {modelContextHolder}
        {orderListElement}
      </>
    ),
    anchorElement,
    summaryElement,
    contentRef,
    callOrderAPI,
  }
}
