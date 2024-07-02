import React, { memo, useCallback, useState, useMemo, useContext } from 'react'
import { Flex, Statistic, Space, Empty, DatePicker, FloatButton } from 'antd'
import { BarChartOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { useLiveQuery } from 'dexie-react-hooks'
import { isNil } from 'lodash'

import { AppContext } from 'src/components/App/context'
import {
  DATE_FORMAT_DATE,
  DATE_FORMAT_DATETIME_UI,
  getCorrectAmount,
  toCurrency,
  toCurrencyNumber,
  getHourFormat,
  getCommoditiesInfo,
} from 'src/libs/common'
import { isAMPM } from 'src/constants/defaults/workshift'
import Chart from 'src/components/Chart'
import {
  CHART_BORDER_COLORS,
  CHART_COLORS,
  HOURS,
  pickColor,
} from 'src/libs/chart'

import * as styles from './styles'

const { RangePicker } = DatePicker

const { resMapGroup } = getCommoditiesInfo(undefined, false, true)

export const Statistics: React.FC<{}> = memo(() => {
  const { API } = useContext(AppContext)
  const [dates, setDates] = useState<Dayjs[]>()
  const [dateDescription, setDateDescription] = useState('')

  const todayDate = dayjs.tz()
  const today = todayDate.format(DATE_FORMAT_DATE)

  const [startTime, endTime, displayType] = useMemo(() => {
    if (!dates?.length) {
      return [null, null, null]
    }
    const range = dates.map(day => day.valueOf())
    const dateCount = Math.abs(dates[0].diff(dates[1], 'day'))
    let displayType = 'd'
    if (dateCount <= 7) {
      displayType = 'd'
    } else if (dateCount <= 31) {
      displayType = 'w'
    } else if (dateCount <= 90) {
      displayType = 'm'
    } else if (dateCount <= 180 || dateCount <= 365) {
      displayType = 'q'
    } else if (dateCount > 365) {
      displayType = 'y'
    }
    return [...range, displayType] as [number, number, string]
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

  const { records, dailyDataInfo } = useLiveQuery(
    async () => {
      if (!startTime || !endTime) {
        return {} as Resta.Statistics.StatAPIGet
      }
      return await API.statistics.get(startTime, endTime)
    },
    [startTime, endTime],
    {} as Resta.Statistics.StatAPIGet,
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
    const dateMap = {} as Resta.Statistics.DataMap
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
      const hour = day.hour()
      const isAM = isAMPM(hour) === 'AM'
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

  const handleIncomeChart = useCallback((dateMap: Resta.Statistics.DataMap) => {
    if (!dateMap) return null
    const datasets = [
      {
        label: '上午',
        data: [],
        backgroundColor: CHART_COLORS.yellow,
        stack: 'stack 0',
      },
      {
        label: '下午',
        data: [],
        backgroundColor: CHART_COLORS.blue,
        stack: 'stack 0',
      },
    ]
    const labels = Object.keys(dateMap)
    const firstOneYear = labels[0]?.split?.('/')?.[0]
    let allAreSameYear = true
    const datasetTotal: number[] = []
    labels.forEach((date, index) => {
      const { records, dailyData } = dateMap[date]
      const [year] = date.split('/')
      records.forEach(({ total, $isAM }) => {
        if ($isAM) {
          const data = datasets[0].data
          data[index] = data[index] ?? 0
          data[index] += total
        } else {
          const data = datasets[1].data
          data[index] = data[index] ?? 0
          data[index] += total
        }
      })
      datasetTotal.push(dailyData.total)
      if (year !== firstOneYear) {
        allAreSameYear = false
      }
    })
    return {
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
        plugins: {
          datalabels: {
            anchor: 'end',
            align: 'end',
            formatter(value, context) {
              const total = datasetTotal[context.dataIndex]
              return toCurrency(total)
            },
            display(context) {
              return context.datasetIndex === 1
            },
          },
          // type has issue in chart.js 4.4.3
        } as any,
      },
      data: {
        labels:
          allAreSameYear && firstOneYear
            ? labels.map(each => each.split('/').slice(1).join('/'))
            : labels,
        datasets,
      },
    }
  }, [])
  const handleCustomersChart = useCallback(
    (dateMap: Resta.Statistics.DataMap) => {
      if (!dateMap) return null
      const skipped = (ctx, color) =>
        ctx.p0.skip || ctx.p1.skip ? color : undefined
      const PM = (ctx, color1, color2?) => {
        const target = ctx?.p0DataIndex ? ctx.p0DataIndex : ctx.dataIndex
        return target >= 6 ? color1 : color2
      }
      const datasets = [
        {
          label: '營業時間',
          data: [],
          backgroundColor: ctx =>
            PM(ctx, CHART_COLORS.blue, CHART_COLORS.yellow),
          borderColor: ctx =>
            PM(ctx, CHART_BORDER_COLORS.blue, CHART_BORDER_COLORS.yellow),
          pointStyle: 'circle',
          pointRadius: 10,
          pointHoverRadius: 15,
          segment: {
            pointBackgroundColor: ctx => PM(ctx, CHART_COLORS.blue),
            pointBorderColor: ctx => PM(ctx, CHART_BORDER_COLORS.blue),
            borderColor: ctx =>
              skipped(ctx, CHART_BORDER_COLORS.gray) ||
              PM(ctx, CHART_BORDER_COLORS.blue),
            borderDash: ctx => skipped(ctx, [6, 6]),
          },
          spanGaps: true,
        },
      ]
      const labels: string[] = [...HOURS].map(hour => {
        return `${getHourFormat(hour, true)}${hour === 14 || hour === 15 ? ' 午休' : ''}`
      })
      const dates = Object.keys(dateMap)
      dates.forEach(date => {
        const { records } = dateMap[date]
        records.forEach(({ createdAt }) => {
          const day = dayjs.tz(createdAt)
          const hour = day.hour()
          const index = HOURS.indexOf(hour)
          const data = datasets[0].data
          data[index] = data[index] ?? 0
          ++data[index]
        })
      })
      // break time
      datasets[0].data[4] = NaN
      datasets[0].data[5] = NaN

      return {
        options: {
          responsive: true,
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true,
              beginAtZero: true,
            },
          },
          plugins: {
            totalizer: {
              calculate: true,
            },
            datalabels: {
              anchor: 'end',
              align: 'end',
              formatter(value) {
                return `${value} 人`
              },
            },
            // type has issue in chart.js 4.4.3
          } as any,
          fill: false,
          interaction: {
            intersect: false,
          },
          radius: 0,
        },
        data: {
          labels,
          datasets,
        },
      }
    },
    [],
  )
  const handleMainDishChart = useCallback(
    (dateMap: Resta.Statistics.DataMap) => {
      if (!dateMap) return null
      const datasets = resMapGroup['main-dish'].map((label, index) => {
        return {
          label,
          data: [],
          backgroundColor: pickColor(index),
          stack: 'stack 0',
        }
      })
      const dates = Object.keys(dateMap)
      const labels = dates
      const firstOneYear = labels[0]?.split?.('/')?.[0]
      let allAreSameYear = true
      dates.forEach((date, dateIndex) => {
        const { records } = dateMap[date]
        const [year] = date.split('/')
        records.forEach(({ data }) => {
          data.forEach(({ res, type }) => {
            if (type === 'main-dish') {
              const index = resMapGroup['main-dish'].findIndex(
                name => name === res,
              )
              if (index >= 0) {
                datasets[index].data[dateIndex] =
                  (datasets[index].data[dateIndex] ?? 0) + 1
              }
            }
          })
          if (year !== firstOneYear) {
            allAreSameYear = false
          }
        })
      })

      datasets.push({
        label: 'Total',
        data: [...Array.from(Array(dates.length)).map(() => 0)], // 0s are just placeholders
        datalabels: {
          align: 'end',
          anchor: 'end',
          formatter(value, ctx) {
            let sum = 0
            ctx.chart.data.datasets.forEach(dataset => {
              sum += dataset.data[ctx.dataIndex]
            })
            return toCurrencyNumber(sum)
          },
        },
        stack: 'stack 0',
      })
      return {
        options: {
          responsive: true,
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true,
            },
          },
        },
        data: {
          labels:
            allAreSameYear && firstOneYear
              ? labels.map(each => each.split('/').slice(1).join('/'))
              : labels,
          datasets,
        },
      }
    },
    [],
  )

  console.log('records', displayType, records, dateMap, resMapGroup)

  return (
    <Flex css={styles.minCss} vertical gap={40}>
      <div css={styles.headerCss}>
        <Space css={styles.titleCss}>
          <BarChartOutlined />
          <label>統計報表</label>
        </Space>
        <RangePicker
          showNow
          presets={presets}
          format={DATE_FORMAT_DATETIME_UI}
          placeholder={['開始日期', '結束日期']}
          size="large"
          // @ts-expect-error expected
          value={dates}
          onChange={onRangeChange}
        />
        <label>{dateDescription && `(${dateDescription})`}</label>
      </div>
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
        handle={handleIncomeChart}
        dateMap={dateMap}
      />
      <Chart
        type="line"
        title="客流量分析"
        handle={handleCustomersChart}
        dateMap={dateMap}
      />
      <Chart
        type="bar"
        title="便當銷售分析"
        handle={handleMainDishChart}
        dateMap={dateMap}
      />
      <FloatButton.BackTop visibilityHeight={100} />
    </Flex>
  )
})

export default Statistics
