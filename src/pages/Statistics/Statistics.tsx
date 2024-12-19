import React, { memo, useCallback, useState, useMemo, useContext } from 'react'
import { Flex, Statistic, Space, DatePicker, FloatButton } from 'antd'
import { BarChartOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { useLiveQuery } from 'dexie-react-hooks'
import { isNil } from 'lodash'

import StickyHeader from 'src/components/StickyHeader'
import Chart from 'src/components/Chart'
import { AppContext } from 'src/pages/App/context'
import {
  DATE_FORMAT_DATE,
  DATE_FORMAT_DATETIME_UI,
  getCorrectAmount,
} from 'src/libs/common'
import { isAMPM } from 'src/constants/defaults/workshift'
import { getDateType } from 'src/libs/chart'
import { handleIncomeChart } from './charts/income'
import { handleProfitsChart } from './charts/profits'
import { handleCustomersChart } from './charts/customers'
import { useHandleResChart } from './charts/res'
import { handleOrderTypes } from './charts/orderTypes'
import { handleOrderDeliveryChart } from './charts/orderDelivery'

import * as styles from './styles'

const { RangePicker } = DatePicker
const DEFAULT_QUERY_DATA = {} as Resta.Statistics.StatAPIGet

export const Statistics: React.FC<{}> = memo(() => {
  const { API } = useContext(AppContext)

  const todayDate = dayjs.tz()
  const today = todayDate.format(DATE_FORMAT_DATE)

  const [dates, setDates] = useState<Dayjs[]>(() => [
    todayDate.startOf('day'),
    todayDate.endOf('day'),
  ])
  const [dateDescription, setDateDescription] = useState('今天')

  const [startTime, endTime, dateType] = useMemo(() => {
    if (!dates?.length) {
      return [null, null, undefined]
    }
    const range = dates.map(day => day.valueOf())
    const dateCount = Math.abs(dates[0].diff(dates[1], 'day'))
    const dateType = getDateType(dateCount)
    return [...range, dateType] as [number, number, Resta.Chart.DateType]
  }, [dates])
  // typeof RangePicker.propTypes['presets'] doesn't work
  const presets: any[] = useMemo(() => {
    const todayStartDate = todayDate.startOf('day')
    const todayEndDate = todayDate.endOf('day')
    const yesterStartDate = todayStartDate.add(-1, 'd')
    const isInLastHalfYear = todayStartDate.quarter() > 2
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
        label: '本週',
        value: [todayStartDate.day(1), todayEndDate],
      },
      {
        label: '上週',
        value: [
          todayStartDate.add(-7, 'd').day(1),
          todayEndDate.add(-7, 'd').day(5),
        ],
      },
      {
        label: '2週內',
        value: [todayStartDate.add(-14, 'd').day(1), todayEndDate],
      },
      {
        label: '本月',
        value: [todayStartDate.startOf('M'), todayEndDate],
      },
      {
        label: '上個月',
        value: [
          todayStartDate.add(-1, 'M').startOf('M'),
          todayEndDate.add(-1, 'M').endOf('M'),
        ],
      },
      {
        label: '2月內',
        value: [todayStartDate.add(-1, 'M').startOf('M'), todayEndDate],
      },
      {
        label: '本季',
        value: [todayStartDate.startOf('Q'), todayEndDate],
      },
      {
        label: '上季',
        value: [
          todayStartDate.add(-1, 'Q').startOf('Q'),
          todayEndDate.add(-1, 'Q').endOf('Q'),
        ],
      },
      {
        label: '上半年',
        value: [
          todayStartDate.startOf('y'),
          todayStartDate.month(5).endOf('M'),
        ],
      },
      isInLastHalfYear
        ? {
            label: '下半年',
            value: [
              todayStartDate.month(6).startOf('M'),
              todayEndDate.endOf('y'),
            ],
          }
        : null,
      {
        label: '今年',
        value: [todayStartDate.startOf('y'), todayEndDate.endOf('y')],
      },
      {
        label: '去年',
        value: [
          todayStartDate.add(-1, 'y').startOf('y'),
          todayEndDate.add(-1, 'y').endOf('y'),
        ],
      },
      {
        label: '2年內',
        value: [todayStartDate.add(-1, 'y'), todayEndDate],
      },
    ].filter(each => each)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today])
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

  // === APIs ===
  const { records, dailyDataInfo } = useLiveQuery(
    async () => {
      if (!startTime || !endTime) {
        return DEFAULT_QUERY_DATA
      }
      return await API.statistics.get(startTime, endTime)
    },
    [startTime, endTime],
    DEFAULT_QUERY_DATA,
  )

  const summayData = useMemo(() => {
    if (!records || !dailyDataInfo) {
      return {
        incomeTotal: null,
        incomeAMTotal: null,
        incomePMTotal: null,
        recordsCount: null,
        resCount: null,
        mainDishCount: null,
        profits: null,
        cost: null,
        dateMap: null,
      }
    }
    const dateMap = {} as Resta.Chart.DateMap
    let incomeTotal = 0,
      incomeAMTotal = 0,
      incomePMTotal = 0,
      resCount = 0,
      mainDishCount = 0,
      profits = 0,
      cost = 0

    dailyDataInfo.forEach(each => {
      const { date, total } = each
      incomeTotal += total
      dateMap[date] = dateMap[date] ?? {
        records: [],
        dailyData: each,
      }
    })
    records.forEach(record => {
      const { createdAt, data, total } = record
      const day = dayjs.tz(createdAt)
      const date = day.format(DATE_FORMAT_DATE)
      const isAM = isAMPM(day.hour(), day.minute()) === 'AM'
      if (isAM) {
        incomeAMTotal += total
      } else {
        incomePMTotal += total
      }
      data.forEach(({ res, type, amount }) => {
        const count = getCorrectAmount(amount)
        if (res) {
          if (type === 'main-dish') {
            mainDishCount += count
          }
          resCount += count
        }
      })
      const customRecord = record as RestaDB.OrderRecord
      customRecord.$isAM = isAM
      dateMap[date].records.push(customRecord)
    })
    return {
      incomeTotal,
      incomeAMTotal,
      incomePMTotal,
      resCount,
      mainDishCount,
      profits,
      cost,
      recordsCount: records?.length ?? 0,
      dateMap,
    }
  }, [records, dailyDataInfo])

  const {
    incomeTotal,
    profits,
    cost,
    recordsCount,
    incomeAMTotal,
    incomePMTotal,
    resCount,
    mainDishCount,
    dateMap,
  } = summayData

  // console.log('records', dateType, records, dateMap)

  return (
    <>
      <StickyHeader cls={styles.headerCss}>
        <Space css={styles.titleCss}>
          <BarChartOutlined />
          <label>統計報表</label>
        </Space>
        <RangePicker
          showNow
          inputReadOnly
          presets={presets}
          format={DATE_FORMAT_DATETIME_UI}
          placeholder={['開始日期', '結束日期']}
          size="large"
          // @ts-expect-error expected
          value={dates}
          onChange={onRangeChange}
        />
        <label>{dateDescription && `(${dateDescription})`}</label>
      </StickyHeader>
      <Flex css={styles.mainCss} vertical gap={40}>
        <div css={styles.summaryCss}>
          <Flex>
            <div css={styles.statCss}>
              <Statistic
                title="總營業額 (含修正)"
                prefix={isNil(incomeTotal) ? '' : '$'}
                value={incomeTotal ?? '---'}
              />
            </div>
            <div css={styles.statCss}>
              <Statistic
                title="淨利"
                prefix={isNil(profits) ? '' : '$'}
                value={profits ?? '---'}
              />
            </div>
            <div css={styles.statCss}>
              <Statistic
                title="成本"
                prefix={isNil(cost) ? '' : '$'}
                value={cost ?? '---'}
              />
            </div>
            <div css={styles.statCss}>
              <Statistic
                title="訂單數量"
                prefix={isNil(recordsCount) ? '' : '$'}
                value={recordsCount ?? '---'}
              />
            </div>
          </Flex>
          <Flex>
            <div css={styles.statCss}>
              <Statistic
                title="上午營業額"
                prefix={isNil(incomeAMTotal) ? '' : '$'}
                value={incomeAMTotal ?? '---'}
              />
            </div>
            <div css={styles.statCss}>
              <Statistic
                title="下午營業額"
                prefix={isNil(incomePMTotal) ? '' : '$'}
                value={incomePMTotal ?? '---'}
              />
            </div>
            <div css={styles.statCss}>
              <Statistic
                title="銷售便當數量"
                prefix={isNil(mainDishCount) ? '' : '$'}
                value={mainDishCount ?? '---'}
              />
            </div>
            <div css={styles.statCss}>
              <Statistic
                title="銷售商品數量"
                prefix={isNil(resCount) ? '' : '$'}
                value={resCount ?? '---'}
              />
            </div>
          </Flex>
        </div>
        <Chart
          type="bar"
          title="營收分析"
          dateMap={dateMap}
          dateType={dateType}
          handle={handleIncomeChart}
        />
        <Chart
          type="bar"
          title="淨利分析"
          dateMap={dateMap}
          dateType={dateType}
          handle={handleProfitsChart}
        />
        <Chart
          type="line"
          title="客流量分析"
          dateMap={dateMap}
          dateType={dateType}
          allowedDateType={null}
          handle={handleCustomersChart}
        />
        <Chart
          type="bar"
          title="便當銷售分析"
          dateMap={dateMap}
          dateType={dateType}
          handle={useHandleResChart('main-dish')}
        />
        <Chart
          type="bar"
          title="單點銷售分析"
          dateMap={dateMap}
          dateType={dateType}
          color="2"
          handle={useHandleResChart('à-la-carte')}
        />
        <Chart
          type="bar"
          title="零售銷售分析"
          dateMap={dateMap}
          dateType={dateType}
          handle={useHandleResChart('others')}
        />
        <Chart
          type="bar"
          title="訂單備註分析"
          dateMap={dateMap}
          dateType={dateType}
          // @ts-expect-error expected
          handle={handleOrderTypes}
        />
        <Chart
          type="doughnut"
          title="送外訂單分析"
          dateMap={dateMap}
          dateType={dateType}
          color="2"
          allowedDateType={null}
          handle={handleOrderDeliveryChart}
        />
        <FloatButton.BackTop visibilityHeight={100} />
      </Flex>
    </>
  )
})

export default Statistics
