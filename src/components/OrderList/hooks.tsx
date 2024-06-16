import React, {
  useEffect,
  useRef,
  useContext,
  useMemo,
  useCallback,
} from 'react'
import { Flex, Statistic, Anchor, notification, Modal, Divider } from 'antd'
import { useLiveQuery } from 'dexie-react-hooks'
import dayjs from 'dayjs'

import { AppContext } from 'src/components/App/context'
import { Order } from 'src/components/Order'
import { WORK_SHIFT } from 'src/constants/defaults/workshift'
import * as styles from './styles'

const workShift = [...WORK_SHIFT].reverse()
const errMsgMap = {
  add: '新增訂單失敗',
  edit: '編輯訂單失敗',
  delete: '刪除訂單失敗',
}

export function useOrderList(
  datetime: [number, number] | 'today',
  onAction?: Resta.Order.Props['onAction'],
  onCancelEdit?: Resta.Order.Props['onCancelEdit'],
  getAnchorContainer?: () => HTMLElement,
) {
  let totalCount = 0
  let soldItemsCount = 0
  let orderListElement: JSX.Element = null
  // eslint-disable-next-line react-hooks/exhaustive-deps
  let periods = [] // needs always update-to-date
  const { API } = useContext(AppContext)
  const [noti, contextHolder] = notification.useNotification()
  const [modal, modelContextHolder] = Modal.useModal()
  const [startTime, endTime] = useMemo(() => {
    const today = dayjs()
    return datetime === 'today'
      ? [today.startOf('day').valueOf(), today.endOf('day').valueOf()]
      : datetime
  }, [datetime])

  const records = useLiveQuery(
    () => {
      return API.orders.get(startTime, endTime)
    },
    [datetime],
    [] as RestaDB.Table.Order[],
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
    async (record, action, createdAt?) => {
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
            if (!createdAt) {
              record.createdAt = dayjs().valueOf()
            }
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
      }
      return null
    },
    [API, modal, openNotification],
  )
  if (records.length) {
    const theDate = dayjs(startTime)
    const dateTodayString = theDate.format('YYYY-MM-DD')
    periods = workShift.map(({ title, startTime, key }) => {
      const [hours, minutes] = startTime.split(':')
      return {
        title,
        id: `resta-anchor-${dateTodayString}-${key}`,
        createdAt: theDate.hour(+hours).minute(+minutes).valueOf(),
        elements: [],
      }
    })
    records.forEach(record => {
      const { data, total, createdAt, number } = record
      totalCount += total
      soldItemsCount += data.filter(({ res }) => !!res).length
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
          getContainer={getAnchorContainer}
          bounds={20}
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

  console.log('records', records)

  return {
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
    callOrderAPI,
  }
}
