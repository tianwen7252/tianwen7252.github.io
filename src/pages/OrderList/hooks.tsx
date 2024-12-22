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
  Empty,
  Tabs,
} from 'antd'
import type { AnchorProps } from 'antd'
import { useLiveQuery } from 'dexie-react-hooks'
import dayjs from 'dayjs'
import { debounce } from 'lodash-es'

import { AppContext } from 'src/pages/App/context'
import { Order } from 'src/components/Order'
import {
  WORK_SHIFT_REVERSED,
  isAMPM,
  TODAY_LABELS,
  LABEL_MAP,
} from 'src/constants/defaults/workshift'
import { ORDER_TYPES_OPTIONS } from 'src/constants/defaults/orderTypes'
import {
  getCorrectAmount,
  DATE_FORMAT,
  DATE_FORMAT_FOR_ANCHOR,
  ORDER_LIST_PAGE_SIZE,
} from 'src/libs/common'
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

export function setPeriodMap(
  periodMap: Resta.OrderList.PeriodMap,
  createdAt: number,
) {
  const theDate = dayjs.tz(createdAt)
  const dateString = theDate.format('YYYY-MM-DD')
  periodMap[dateString] = periodMap[dateString] ?? {
    periods: WORK_SHIFT_REVERSED.map(
      ({ title, startTime: workStartTime, key, color }) => {
        const [hours, minutes] = workStartTime.split(':')
        return {
          title,
          key,
          id: `resta-anchor-${dateString}-${key}`,
          createdAt: theDate.hour(+hours).minute(+minutes).valueOf(),
          elements: [],
          elementsProps: [],
          color,
          total: 0,
          numberCount: 0,
        }
      },
    ),
    datetime: createdAt, // usinng the first one is enough
    dateWithWeek: theDate.format(DATE_FORMAT),
    AM: {
      soldCount: 0,
      recordCount: 0,
      total: 0,
    },
    PM: {
      soldCount: 0,
      recordCount: 0,
      total: 0,
    },
    today: {
      soldCount: 0,
      recordCount: 0,
      total: 0,
    },
  }
  const dateData = periodMap[dateString]
  return {
    dateData,
    periods: dateData.periods,
  }
}

export function getPeriodsOrder(
  periodMap: Resta.OrderList.PeriodMap,
  desc = true,
) {
  return Object.keys(periodMap).sort((a, b) => {
    return desc ? b.localeCompare(a) : a.localeCompare(b)
  })
}

export function correctMealsAmount(record: RestaDB.NewOrderRecord) {
  const mealMap = new Map<
    string,
    { amount: number; type: string; value: string }
  >()
  let hasChange = false

  // merge the same meal
  for (const { res, amount, type, value } of record.data) {
    if (!res) continue

    const existing = mealMap.get(res)
    if (existing?.type === type) {
      hasChange = true
      existing.amount += getCorrectAmount(amount)
    } else {
      mealMap.set(res, { amount: getCorrectAmount(amount), type, value })
    }
  }

  // rebuild the order if data has merged
  if (hasChange && mealMap.size) {
    const newData = Array.from(mealMap)
      .flatMap(([res, { amount, type, value }]) => [
        { res, type, value, ...(amount > 1 ? { amount: String(amount) } : {}) },
        ...(amount > 1 ? [{ value: String(amount), operator: '*' }] : []),
        { value: '', operator: '+' },
      ])
      .slice(0, -1) as RestaDB.OrderData[] // remove the last '+'
    record.data = newData
    // console.log(
    //   record.data,
    //   mealMap.keys(),
    //   Object.fromEntries(mealMap),
    //   newData,
    // )
  }
}

export const TODAY = 'today'

export function useOrderList({
  datetime,
  searchData,
  dateOrder = true, // true is desc date order
  searchUI = true,
  reverse = true,
  orderPageMode = false,
  vertical = orderPageMode,
  emptyDescription,
  offset = 0,
  limit = ORDER_LIST_PAGE_SIZE,
  handleRecords,
  search,
}: {
  datetime: number[] | typeof TODAY
  searchData?: string[]
  dateOrder?: boolean
  searchUI?: boolean
  reverse?: boolean
  vertical?: boolean
  orderPageMode?: boolean
  emptyDescription?: React.ReactNode
  offset?: number
  limit?: number
  handleRecords?: Resta.OrderList.HandleRecords
  search?: Resta.APIFn.Orders.SearchCallback
}) {
  datetime = datetime ?? TODAY
  const today = dayjs.tz()
  const todayDate = today.format(DATE_FORMAT)
  const { API } = useContext(AppContext)
  const [noti, contextHolder] = notification.useNotification()
  const [modal, modelContextHolder] = Modal.useModal()
  const [startTime, endTime] = useMemo(() => {
    return datetime === TODAY
      ? [today.startOf('day').valueOf(), today.endOf('day').valueOf()]
      : datetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datetime, todayDate]) // use todayDate instead of today
  const getCategoryLabel = useCallback(() => {
    const now = dayjs.tz()
    return isAMPM(now.hour(), now.minute())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayDate]) // use todayDate to update
  const [categoryLabel, setCategoryLabel] = useState(getCategoryLabel)
  const [searchText, setSearchText] = useState<string[]>([])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSearch = useCallback(
    debounce((value: typeof searchText) => {
      setSearchText(value)
    }, 500),
    [],
  )
  const contentRef = useRef<HTMLDivElement>()
  // const tabKeyToUpdate = useRef(1)
  // const getAnchorContainer = useCallback(() => {
  //   // not working well...
  //   return contentRef.current
  // }, [])
  const getEmptyUI = useCallback(
    (isSearch = false) => {
      return (
        <Flex css={styles.emptyCss}>
          <Empty
            description={isSearch ? '查無資料' : emptyDescription}
            style={{ marginTop: 100 }}
          />
        </Flex>
      )
    },
    [emptyDescription],
  )
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
            correctMealsAmount(record)
            const result = await API.orders.add(record)
            openNotification({
              message: '',
              type: 'success',
              description: '新增訂單成功!',
            })
            return result
          }
          case 'edit': {
            correctMealsAmount(record)
            const result = await API.orders.set(
              record.id,
              record as RestaDB.NewOrderRecord,
            )
            openNotification({
              message: '',
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
                  API.orders.delete(record.id, record)
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
        if (action === 'add') {
          const label = getCategoryLabel()
          if (label !== categoryLabel) {
            setCategoryLabel(label)
          }
        }
      }
      return null
    },
    [API, modal, categoryLabel, getCategoryLabel, openNotification],
  )
  // get db dtata
  const queryResult = useLiveQuery(async () => {
    const list = await API.orders.get({
      startTime,
      endTime,
      reverse,
      searchText: searchData ?? searchText,
      search,
    })
    const records = handleRecords?.(list) ?? list
    let totalCount = 0
    let soldItemsCount = 0
    let totalDays = 0
    let periodsOrder = [] as string[]
    let orderListElement: JSX.Element = null
    let contentElement: JSX.Element[] | JSX.Element = null
    let anchorElement: JSX.Element = null
    let summaryElement: JSX.Element = null
    const periodMap = {} as Resta.OrderList.PeriodMap // needs always update-to-date
    const recordLength = records?.length
    if (recordLength || searchText.length) {
      const searchResultNotFound = !!(recordLength === 0 && searchText.length)
      records?.forEach(record => {
        const { data, total, createdAt } = record
        const { dateData, periods } = setPeriodMap(periodMap, createdAt)
        totalCount += total
        ++dateData.today.recordCount
        let soldCountOfRecord = 0
        data.forEach(({ res, amount }) => {
          if (res) {
            const soldCount = getCorrectAmount(amount)
            soldCountOfRecord += soldCount
            dateData.today.soldCount += soldCount
          }
        })
        // set category (AM or PM) data
        const day = dayjs.tz(createdAt)
        const category = isAMPM(day.hour(), day.minute())
        const categoryData = dateData[category]
        ++categoryData.recordCount
        categoryData.total += total
        categoryData.soldCount += soldCountOfRecord
        soldItemsCount += soldCountOfRecord
        const createOrderElement = (period: Resta.OrderList.Period) => {
          ++period.numberCount
          const { elements, elementsProps, numberCount } = period
          period.total += total
          const key = `${createdAt}-${numberCount}`
          if (orderPageMode) {
            elementsProps.push({
              record,
              key,
              number: numberCount,
              callOrderAPI,
            })
          } else {
            elements.push(
              <Order
                key={key}
                record={record}
                number={numberCount}
                callOrderAPI={callOrderAPI}
              />,
            )
          }
        }
        const result = periods.some(period => {
          const { createdAt: time } = period
          if (createdAt >= time) {
            createOrderElement(period)
            return true
          }
          return false
        })
        // not found, put it to the last
        if (!result) {
          const last = periods.at(-1)
          createOrderElement(last)
        }
      })
      // process periods data
      periodsOrder = getPeriodsOrder(periodMap, dateOrder)
      totalDays = periodsOrder.length
      if (limit) {
        periodsOrder = periodsOrder.slice(offset, offset + limit)
      }
      const yearMap = {} as {
        [year: string]: {
          yearId: string
          dateElements: (JSX.Element | JSX.Element[])[]
          anchorItems: AnchorProps['items']
        }
      }
      let todaysPeriod: Resta.OrderList.DateData = null
      if (orderPageMode) {
        todaysPeriod = periodMap[Object.keys(periodMap)[0]]
        if (todaysPeriod) {
          const { periods } = todaysPeriod
          // needs today's all elements
          const todayElements = []
          const tabItems = periods
            .map(
              ({
                elements,
                elementsProps,
                numberCount,
                title,
                key,
                createdAt,
              }) => {
                elementsProps.forEach((props, index) => {
                  // adjust the number count
                  props.number = numberCount - index
                  const elKey = `${createdAt}-${props.number}`
                  elements.push(<Order {...props} key={elKey} />)
                  // for today's all elements
                  const number = props.record.number
                  props.number = number
                  todayElements.push(
                    <Order {...props} key={`${createdAt}-${number}`} />,
                  )
                })
                return {
                  label: title,
                  key,
                  children: (
                    <Flex gap={10} wrap>
                      {elements}
                    </Flex>
                  ),
                }
              },
            )
            .reverse()
          tabItems.push({
            label: TODAY_LABELS[1],
            key: TODAY_LABELS[0],
            children: (
              <Flex gap={10} wrap>
                {todayElements}
              </Flex>
            ),
          })
          contentElement = (
            <Tabs
              tabPosition="right"
              items={tabItems}
              activeKey={categoryLabel}
              onChange={setCategoryLabel}
            />
          )
        }
      } else {
        periodsOrder.forEach(date => {
          const dateId = `resta-anchor-${date}`
          const dateData = periodMap[date]
          const { periods, dateWithWeek, datetime } = dateData
          const year = date.split('-')[0]
          const yearId = `resta-anchor-${year}`
          const map = (yearMap[year] = yearMap[year] ?? {
            yearId,
            dateElements: [],
            anchorItems: [],
          })
          const { dateElements, anchorItems } = map
          const anchorDate = dayjs.tz(datetime).format(DATE_FORMAT_FOR_ANCHOR)
          anchorItems.push({
            key: `${year}-${anchorDate}`,
            href: `#${dateId}`,
            title: anchorDate,
            children: [],
          })
          !orderPageMode && periods.reverse()
          const periodElements = periods
            .filter(({ elements }) => elements.length)
            .map(({ elements, id, color, title }) => {
              const style = {
                backgroundColor: color,
              }
              anchorItems.at(-1).children.push({
                key: id,
                href: `#${id}`,
                title,
              })
              return (
                <Flex
                  css={styles.panelCss}
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

          const { today, AM, PM } = dateData
          const AMTotal = Math.round(AM.total)
          const PMTotal = Math.round(PM.total)
          const dayTotal = AMTotal + PMTotal
          const dayElement = (
            <section css={styles.sectionCss} key={date}>
              <h1 id={dateId}>{dateWithWeek}</h1>
              <Flex css={styles.symmaryCss} justify="space-between">
                <Statistic title={summaryText[0]} value={today.recordCount} />
                <Statistic title={summaryText[1]} value={today.soldCount} />
                <Statistic title={summaryText[3]} prefix="$" value={AMTotal} />
                <Statistic title={summaryText[4]} prefix="$" value={PMTotal} />
                <Statistic title={summaryText[2]} prefix="$" value={dayTotal} />
              </Flex>
              {periodElements}
            </section>
          )
          dateElements.push(dayElement)
        })
      }

      // render content
      if (!searchResultNotFound) {
        const anchorProps = {
          css: styles.anchorCss,
        }
        if (!orderPageMode) {
          const yearAnchorItems = [] as AnchorProps['items']
          const years = Object.keys(yearMap)
          if (dateOrder) {
            years.sort().reverse() // effect than using sort(fn)
          }
          contentElement = years.map(year => {
            const { yearId, dateElements, anchorItems } = yearMap[year]
            yearAnchorItems.push({
              key: year,
              href: `#${yearId}`,
              title: year,
              children: anchorItems,
            })
            return (
              <article id={yearId} key={yearId}>
                {dateElements}
              </article>
            )
          })
          anchorElement = (
            <Anchor
              {...anchorProps}
              items={yearAnchorItems}
              offsetTop={64}
              targetOffset={100}
              bounds={220} // 100
            />
          )
        }
      }

      // render the whole order list with search and tabs/anchor
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
                options={ORDER_TYPES_OPTIONS}
              />
            )}
            {searchResultNotFound ? (
              getEmptyUI(searchResultNotFound)
            ) : (
              <>
                <div className="resta-orders-content">{contentElement}</div>
              </>
            )}
          </div>
        </Flex>
      )

      totalCount = Math.round(totalCount)
      const onePeriod = periodsOrder.length === 1
      const summaryDesc = onePeriod ? summaryText : allSummaryText
      // for all or today
      let summaryOrdersCount = recordLength ?? 0
      let summarySoldItemsCount = soldItemsCount
      let summaryTotalCount = totalCount
      // for orderpage's AM or PM
      if (
        orderPageMode &&
        todaysPeriod &&
        (categoryLabel === 'AM' || categoryLabel === 'PM')
      ) {
        const categoryData = todaysPeriod[categoryLabel]
        summaryOrdersCount = categoryData.recordCount
        summarySoldItemsCount = categoryData.soldCount
        summaryTotalCount = categoryData.total
      }
      summaryElement =
        !orderPageMode && onePeriod ? null : (
          <Flex css={styles.symmaryCss} justify="space-between">
            <div css={!orderPageMode && styles.statWrapperCss}>
              <Statistic
                title={`${orderPageMode ? LABEL_MAP[categoryLabel] : ''}${summaryDesc[0]}`}
                value={summaryOrdersCount}
              />
            </div>
            <div css={!orderPageMode && styles.statWrapperCss}>
              <Statistic
                title={`${orderPageMode ? LABEL_MAP[categoryLabel] : ''}${summaryDesc[1]}`}
                value={summarySoldItemsCount}
              />
            </div>
            <div css={!orderPageMode && styles.statWrapperCss}>
              <Statistic
                title={`${orderPageMode ? LABEL_MAP[categoryLabel] : ''}${summaryDesc[2]}`}
                prefix="$"
                value={summaryTotalCount}
              />
            </div>
          </Flex>
        )
    } else if (recordLength === 0) {
      orderListElement = getEmptyUI()
    } else {
      // loading
      // setTimeout(() => {
      //   if (!records) {
      //     orderListElement = <Skeleton active round />
      //   }
      // }, 150) // delay to show loading
    }
    return {
      records,
      recordLength,
      totalCount,
      totalDays,
      soldItemsCount,
      periodsOrder,
      orderListElement,
      anchorElement,
      summaryElement,
    }
  }, [
    startTime,
    endTime,
    searchText,
    categoryLabel,
    searchData,
    offset,
    limit,
    reverse,
    orderPageMode,
    dateOrder,
    searchUI,
    vertical,
    handleRecords,
    search,
  ])

  const lastRecordNumber = useLiveQuery(async () => {
    let count = 0
    // only OrderPage needs lastRecordNumber
    if (orderPageMode) {
      const [todayStartTime, todayEndTime] = [
        today.startOf('day').valueOf(),
        today.endOf('day').valueOf(),
      ]
      count = await API.orders.count({
        startTime: todayStartTime,
        endTime: todayEndTime,
      })
    }
    return count
  }, [todayDate, orderPageMode])

  const {
    records,
    recordLength,
    totalCount,
    totalDays,
    soldItemsCount,
    periodsOrder,
    orderListElement,
    anchorElement,
    summaryElement,
  } = queryResult ?? { periodsOrder: [] }

  // console.log('records', records)

  return {
    records,
    recordLength,
    totalCount,
    totalDays,
    soldItemsCount,
    periodsOrder,
    lastRecordNumber,
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
