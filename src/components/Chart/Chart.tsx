import React, {
  memo,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react'
import { Space, Empty, Segmented, Flex } from 'antd'
import { BarChartOutlined, LineChartOutlined } from '@ant-design/icons'
import { filter, includes } from 'lodash'
import { Chart as ChartJS } from 'chart.js'
import { Bar, Line, Bubble } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm'
import 'chart.js/auto'

import {
  DATE_TYPE_MAP,
  DEFAULT_ALLOWED_TYPES,
  DATE_TYPE_ALLOWED_MAP,
} from 'src/libs/chart'
import 'src/libs/chartTotalizer'
import * as styles from './styles'

ChartJS.register(ChartDataLabels)
ChartJS.defaults.plugins.legend.position = 'bottom'

export const Chart: React.FC<Resta.Chart.Props> = memo(
  ({
    dateMap,
    dateType = 'd',
    title,
    type,
    allowedDateType = DEFAULT_ALLOWED_TYPES,
    handle,
  }) => {
    const [config, setConfig] = useState<Resta.Chart.ChartConfig>(null)
    const [
      selectedDateType = DATE_TYPE_MAP[dateType].value,
      setSelectedDateType,
    ] = useState<Resta.Chart.DateType>()
    const skipRef = useRef(false)

    const Component = useMemo(() => {
      switch (type) {
        case 'line':
          return Line
        case 'bubble':
          return Bubble
        case 'bar':
        default:
          return Bar
      }
    }, [type])
    const titleIcon = useMemo(() => {
      switch (type) {
        case 'line':
          return <LineChartOutlined />
        case 'bar':
        default:
          return <BarChartOutlined />
      }
    }, [type])
    const dateTypeOptions = useMemo(() => {
      if (allowedDateType && dateMap) {
        const allOptions = allowedDateType.trim().split('|')
        // get duplicated ones
        const options = filter(
          allOptions.concat(DATE_TYPE_ALLOWED_MAP[dateType]),
          (val, i, iteratee) => includes(iteratee, val, i + 1),
        ) as Resta.Chart.DateType[]
        // actual date type of the date range
        // ...TODO
        return options.map(type => DATE_TYPE_MAP[type.trim()])
      }
      return []
    }, [dateMap, dateType, allowedDateType])

    const onChangeDateType = useCallback((value: Resta.Chart.DateType) => {
      setSelectedDateType(value)
    }, [])

    useEffect(() => {
      // if the user change the date range
      if (
        dateTypeOptions.length &&
        !dateTypeOptions.some(({ value }) => value === selectedDateType)
      ) {
        skipRef.current = true // skip running process because the new date will be coming afterwards
        setSelectedDateType(dateTypeOptions[0].value)
      }
    }, [dateTypeOptions, selectedDateType])

    useEffect(() => {
      const process = async () => {
        const result = await handle?.(dateMap, selectedDateType)
        result && setConfig(result)
      }
      !skipRef.current && process()
      skipRef.current = false
    }, [dateMap, handle, selectedDateType])

    return (
      <div css={styles.chartCss}>
        <Flex css={styles.headerCss}>
          <Space css={styles.labelCss}>
            {titleIcon}
            <label>{title}</label>
          </Space>
          {allowedDateType && (
            <Segmented
              options={dateTypeOptions}
              value={selectedDateType}
              onChange={onChangeDateType}
            />
          )}
        </Flex>
        {config ? (
          // @ts-expect-error due to dynamic type definition
          <Component options={config.options} data={config.data} />
        ) : (
          <Empty description={false} image={titleIcon} />
        )}
      </div>
    )
  },
)

export default Chart
