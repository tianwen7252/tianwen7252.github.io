import React, {
  useCallback,
  useRef,
  useState,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import {
  Drawer,
  Flex,
  Button,
  Select,
  DatePicker,
  InputNumber,
  FloatButton,
  Space,
  Switch,
  Pagination,
} from 'antd'
import type { DatePickerProps } from 'antd'
import {
  ReloadOutlined,
  FileSearchOutlined,
  EditOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { debounce } from 'lodash'

import StickyHeader from 'src/components/StickyHeader'
import {
  DATE_FORMAT_DATE,
  DATE_FORMAT_DATETIME_UI,
  ORDER_LIST_PAGE_SIZE,
  toCurrencyNumber,
} from 'src/libs/common'
import { ORDER_TYPES_OPTIONS } from 'src/constants/defaults/orderTypes'
import { useOrderList } from './hooks'
import { AppContext } from 'src/pages/App/context'
import { Keyboard } from 'src/components/Keyboard'
import * as styles from './styles'

const { RangePicker } = DatePicker

export const OrderList: React.FC<{}> = () => {
  const [dates, setDates] = useState<Dayjs[]>()
  const [searchData, setSearchData] = useState<string[]>([])
  const [orderTotal, setOrderTotal] = useState<number>(0)
  const [turnoverSum, setTurnoverSum] = useState<number>(0)
  const [ordersSum, setOrdersSum] = useState<number>(0)
  const [isSearchOpen, setSearchDrawer] = useState(false)
  const [isKeyboardOpen, setKeyboardDrawer] = useState(false)
  const [showTime, setShowTime] = useState(false)
  const [dateOrder, setDateOrder] = useState(true) // true is desc date order
  const [offset, setOffset] = useState(0)
  const [dateDescription, setDateDescription] = useState('')
  const { appEvent } = useContext(AppContext)
  const isDisabled = !dates?.length

  const presets: any[] = useMemo(() => {
    const todayDate = dayjs.tz()
    const todayStartDate = todayDate.startOf('day')
    const todayEndDate = todayDate.endOf('day')
    const yesterStartDate = todayStartDate.add(-1, 'd')
    return [
      {
        label: '今天',
        value: [todayStartDate, todayEndDate],
      },
      {
        label: '昨天',
        value: [yesterStartDate, yesterStartDate.endOf('day')],
      },
      {
        label: '2天內',
        value: [yesterStartDate, todayEndDate],
      },
      {
        label: '7天前',
        value: [todayStartDate.add(-7, 'd'), todayEndDate],
      },
      {
        label: '14天內',
        value: [todayStartDate.add(-14, 'd'), todayEndDate],
      },
      {
        label: '1個月內',
        value: [todayStartDate.add(-30, 'd'), todayEndDate],
      },
    ]
  }, [])

  const openSearchDrawer = useCallback(() => {
    setSearchDrawer(true)
  }, [])
  const closeSearchDrawer = useCallback(() => {
    setSearchDrawer(false)
  }, [])
  const openKeyboardDrawer = useCallback(() => {
    document.body.classList.add('resta--hidden-scroll')
    setKeyboardDrawer(true)
  }, [])
  const closeKeyboardDrawer = useCallback(() => {
    document.body.classList.remove('resta--hidden-scroll')
    setKeyboardDrawer(false)
    appEvent.fire(appEvent.ORDER_AFTER_ACTION)
  }, [appEvent])
  const onRangeChange = useCallback(
    (dates: null | (Dayjs | null)[]) => {
      if (dates) {
        const [start, end] = dates
        const result = presets.some(({ label, value }) => {
          const result =
            value[0].valueOf() === start.valueOf() &&
            value[1].valueOf() === end.valueOf()
          if (result) {
            setDateDescription(label)
          }
          return result
        })
        if (!result) {
          setDateDescription('')
        }
        setDates(dates)
      }
    },
    [presets],
  )
  const onChangesearchData = useCallback(
    debounce((value: typeof searchData) => {
      setSearchData(value)
    }, 300),
    [],
  )
  const onChangeOrderTotal = useCallback(
    debounce((value: number) => {
      setOrderTotal(value)
    }, 500),
    [],
  )
  const onChangeTurnoverSum = useCallback(
    debounce((value: number) => {
      setTurnoverSum(value)
    }),
    [],
  )
  const onChangeOrdersSum = useCallback(
    debounce((value: number) => {
      setOrdersSum(value)
    }),
    [],
  )
  const onSetShowTime = useCallback(() => {
    setShowTime(status => !status)
  }, [])
  const onToggleDateOrder = useCallback(() => {
    setDateOrder(dateOrder => !dateOrder)
  }, [])
  const onPageChange = useCallback((page: number) => {
    setOffset((page - 1) * ORDER_LIST_PAGE_SIZE)
  }, [])
  const disabled1MonthDate: DatePickerProps['disabledDate'] = useCallback(
    (current, { from }) => {
      if (from) {
        // allow maximum 32 days
        return Math.abs(current.diff(from, 'day')) > 31
      }
      return false
    },
    [],
  )
  const reset = useCallback(() => {
    setDates([])
    setSearchData([])
    setOrderTotal(0)
    setTurnoverSum(0)
    setOrdersSum(0)
  }, [])
  const dateGroup = useRef<{
    [dayStart: string]: {
      ordersSum: number
      total: number
    }
  }>({})
  const handleRecords: Resta.OrderList.HandleRecords = useCallback(
    records => {
      dateGroup.current = {}
      return records
        .filter(({ total, createdAt }) => {
          const dayStart = dayjs.tz(createdAt).format(DATE_FORMAT_DATE)
          const group = (dateGroup.current[dayStart] = dateGroup.current[
            dayStart
          ] ?? {
            ordersSum: 0,
            total: 0,
          })
          group.total += total
          ++group.ordersSum
          if (orderTotal) {
            if (orderTotal && total < orderTotal) {
              return false
            }
          }
          return true
        })
        .filter(({ createdAt }) => {
          if (turnoverSum || ordersSum) {
            const dayStart = dayjs.tz(createdAt).format(DATE_FORMAT_DATE)
            const group = dateGroup.current[dayStart]
            if (group) {
              if (turnoverSum && group.total < turnoverSum) {
                return false
              }
              if (ordersSum && group.ordersSum < ordersSum) {
                return false
              }
            }
          }
          return true
        })
    },
    [orderTotal, turnoverSum, ordersSum],
  )

  const dateRange = useMemo(() => dates?.map?.(date => date.valueOf()), [dates])
  const {
    periodsOrder,
    orderListElement,
    anchorElement,
    summaryElement,
    totalDays,
    callOrderAPI,
  } = useOrderList({
    datetime: dates?.length ? dateRange : 'today',
    searchData,
    dateOrder,
    searchUI: false,
    reverse: false,
    offset,
    handleRecords,
  })

  useEffect(() => {
    const off = appEvent.on(
      appEvent.KEYBOARD_ON_ACTION,
      (
        event: Resta.AppEventObject<Resta.AppEvent.KEYBOARD_ON_ACTION.Detail>,
      ) => {
        const { action } = event.detail
        action === 'edit' && openKeyboardDrawer()
      },
    )
    return () => off()
  }, [appEvent, openKeyboardDrawer])

  useEffect(() => {
    setTimeout(() => {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
    }, 200)
  }, [offset])

  useEffect(() => {
    // unmount
    return () => {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
    }
  }, [])

  const periodsLength = periodsOrder.length
  return (
    <>
      <StickyHeader cls={styles.headerCss}>
        <Space size={60}>
          <Button
            css={styles.searchBtnCss}
            type="text"
            icon={<FileSearchOutlined />}
            onClick={openSearchDrawer}
          >
            訂單搜尋
          </Button>
          {periodsLength ? (
            <h2>
              {periodsLength === 1
                ? periodsOrder[0]
                : [periodsOrder[0], periodsOrder.at(-1) ?? ''].join(' ~ ')}
              {dateDescription && ` (${dateDescription})`}
            </h2>
          ) : (
            <h2>今天</h2>
          )}
        </Space>
      </StickyHeader>
      <Flex css={styles.mainCss} gap="middle" vertical>
        <Drawer
          css={styles.drawerCss}
          rootClassName="resta-orderlist-search-drawer"
          title={
            <>
              <Button icon={<ReloadOutlined />} type="text" onClick={reset}>
                重設
              </Button>
            </>
          }
          getContainer={false}
          placement="left"
          open={isSearchOpen}
          mask={true}
          onClose={closeSearchDrawer}
        >
          <Flex vertical gap="large">
            <Flex vertical gap="large">
              <h2>日期</h2>
              <RangePicker
                showNow
                presets={presets}
                showTime={showTime}
                format={DATE_FORMAT_DATETIME_UI}
                placeholder={['開始日期', '結束日期']}
                size="large"
                // @ts-expect-error expected
                value={dates}
                disabledDate={disabled1MonthDate}
                onChange={onRangeChange}
                renderExtraFooter={() => (
                  <Button
                    css={styles.toggleTimeBtnCss}
                    type="text"
                    onClick={onSetShowTime}
                  >
                    {showTime ? '關閉時間' : '指定時間'}
                  </Button>
                )}
              />
            </Flex>
            <Flex vertical gap="large">
              <h2>關鍵字</h2>
              <Select
                placeholder="找什麼呢?"
                mode="tags"
                size="large"
                style={{ width: '100%' }}
                allowClear
                onKeyUp={event => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
                options={ORDER_TYPES_OPTIONS}
                disabled={isDisabled}
                value={searchData}
                onChange={onChangesearchData}
              />
            </Flex>
            <Flex vertical gap="large">
              <h2>日期排序</h2>
              <Switch
                checkedChildren="反序"
                unCheckedChildren="正序"
                defaultChecked
                onChange={onToggleDateOrder}
              />
            </Flex>
            <Flex vertical gap="large">
              <h2>單筆金額大於</h2>
              <InputNumber
                size="large"
                prefix="$"
                style={{ width: '60%' }}
                formatter={toCurrencyNumber}
                disabled={isDisabled}
                value={orderTotal}
                onChange={onChangeOrderTotal}
              />
            </Flex>
            <Flex vertical gap="large">
              <h2>當日營業額大於</h2>
              <InputNumber
                size="large"
                prefix="$"
                style={{ width: '60%' }}
                formatter={toCurrencyNumber}
                disabled={isDisabled}
                value={turnoverSum}
                onChange={onChangeTurnoverSum}
              />
            </Flex>
            <Flex vertical gap="large">
              <h2>當日訂單數量大於</h2>
              <InputNumber
                size="large"
                style={{ width: '60%' }}
                formatter={toCurrencyNumber}
                disabled={isDisabled}
                value={ordersSum}
                onChange={onChangeOrdersSum}
              />
            </Flex>
          </Flex>
        </Drawer>
        <Drawer
          css={[styles.drawerCss, styles.keyboardDrawerCss]}
          title={
            <Space>
              <EditOutlined />
              <label>編輯訂單</label>
            </Space>
          }
          placement="right"
          open={isKeyboardOpen}
          mask={true}
          onClose={closeKeyboardDrawer}
          width={820}
          forceRender={true}
        >
          <Keyboard
            drawerMode
            callOrderAPI={callOrderAPI}
            submitCallback={closeKeyboardDrawer}
          />
        </Drawer>
        <div
          css={[
            styles.contentCss,
            (isSearchOpen || isKeyboardOpen) && styles.drawerAcitve,
          ]}
        >
          {anchorElement}
          <div css={styles.listSummaryCss}>{summaryElement}</div>
          <Flex wrap>{orderListElement}</Flex>
          <Pagination
            hideOnSinglePage
            total={totalDays}
            defaultPageSize={ORDER_LIST_PAGE_SIZE}
            onChange={onPageChange}
          />
        </div>
        <FloatButton.BackTop visibilityHeight={100} />
      </Flex>
    </>
  )
}

export default OrderList
