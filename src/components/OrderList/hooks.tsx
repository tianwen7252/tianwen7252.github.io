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
import { useLiveQuery } from 'dexie-react-hooks'
import dayjs from 'dayjs'
import { debounce } from 'lodash'

import { AppContext } from 'src/components/App/context'
import { Order } from 'src/components/Order'
import { WORK_SHIFT } from 'src/constants/defaults/workshift'
import { MEMO_OPTIONS } from 'src/constants/defaults/memos'
import { getCorrectAmount } from 'src/libs/common'
import * as styles from './styles'

const workShift = [...WORK_SHIFT].reverse()

const errMsgMap = {
  add: '新增訂單失敗',
  edit: '編輯訂單失敗',
  delete: '刪除訂單失敗',
}

function setPeriodMap(periodMap: Resta.OrderList.PeriodMap, createAt: number) {
  const theDate = dayjs.tz(createAt)
  const dateString = theDate.format('YYYY-MM-DD')
  periodMap[dateString] = periodMap[dateString] ?? {
    periods: workShift.map(
      ({ title, startTime: workStartTime, key, color }) => {
        const [hours, minutes] = workStartTime.split(':')
        return {
          title,
          id: `resta-anchor-${dateString}-${key}`,
          createdAt: theDate.hour(+hours).minute(+minutes).valueOf(),
          elements: [],
          date: dateString,
          color,
        }
      },
    ),
    total: 0,
    soldCount: 0,
    datetime: createAt, // usinng the first one is enough
  }
  return periodMap[dateString].periods
}

function getPeriodsOrder(periodMap: Resta.OrderList.PeriodMap) {
  return Object.keys(periodMap).sort((a, b) => {
    return b.localeCompare(a)
  })
}

export function useOrderList({
  datetime,
  searchData,
  searchUI = true,
  reverse = true,
  keyboardMode = false,
  vertical = keyboardMode,
  emptyDescription,
  handleRecords,
  search,
  onAction,
  onCancelEdit,
}: {
  datetime: number[] | 'today'
  searchData?: string[]
  searchUI?: boolean
  reverse?: boolean
  vertical?: boolean
  keyboardMode?: boolean
  emptyDescription?: React.ReactNode
  handleRecords?: Resta.OrderList.HandleRecords
  search?: Resta.API.Orders.SearchCallback
  onAction?: Resta.Order.Props['onAction']
  onCancelEdit?: Resta.Order.Props['onCancelEdit']
}) {
  let totalCount = 0
  let soldItemsCount = 0
  let orderListElement: JSX.Element = null
  datetime = datetime ?? 'today'
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const periodMap = {} as Resta.OrderList.PeriodMap // needs always update-to-date
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
    return contentRef.current?.parentElement
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
      const periods = setPeriodMap(periodMap, createdAt)
      totalCount += total
      data.forEach(({ res, amount }) => {
        if (res) {
          soldItemsCount += getCorrectAmount(amount)
        }
      })
      const element = (
        <Order
          key={createdAt}
          record={record}
          number={number}
          onAction={onAction}
          callOrderAPI={callOrderAPI}
          onCancelEdit={onCancelEdit}
        />
      )
      const result = periods.some(({ elements, createdAt: time }) => {
        if (createdAt >= time) {
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
    const periodsOrder = getPeriodsOrder(periodMap)
    const periodElements = periodsOrder.map(date => {
      const { periods } = periodMap[date]
      const orderElements = periods.map(({ elements, id, color, title }) => {
        const style = keyboardMode
          ? null
          : {
              backgroundColor: color,
            }
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
        return orderElements
      }

      return (
        <section key={date}>
          <h1>{date}</h1>
          {orderElements.reverse()}
        </section>
      )
    })

    orderListElement = (
      <Flex css={styles.orderListCss} ref={contentRef} gap={8}>
        <div css={[styles.listCss, !vertical && styles.verticalListCss]}>
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
        {/* {!searchResultNotFound && (
          <Anchor
            css={styles.anchorCss}
            key={anchorKeyToUpdate.current}
            getContainer={getAnchorContainer}
            // offset + searchbox height + searchbox margin-bottom
            bounds={20 + 32 + 16}
            getCurrentAnchor={activeLink => {
              // if afternoon is empty
              if (periods?.[0]?.elements?.length) {
                return activeLink
              }
              return `#${periods.at(-1)?.id}`
            }}
            items={periods.map(({ id, title }) => ({
              key: id,
              href: `#${id}`,
              title,
            }))}
          />
        )} */}
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
  totalCount = Math.round(totalCount)
  const summaryElement = (
    <Flex css={styles.symmaryCss} justify="space-between">
      <Statistic title="訂單數量" value={recordLength ?? 0} />
      <Statistic title="銷售商品數量" value={soldItemsCount} />
      <Statistic title="營業額" prefix="$" value={totalCount} />
    </Flex>
  )

  console.log('records', records)

  return {
    recordLength,
    totalCount,
    lastRecordNumber: records?.at?.(0)?.number || 0,
    soldItemsCount,
    orderListElement: (
      <>
        {contextHolder}
        {modelContextHolder}
        {orderListElement}
      </>
    ),
    summaryElement,
    contentRef,
    callOrderAPI,
  }
}
