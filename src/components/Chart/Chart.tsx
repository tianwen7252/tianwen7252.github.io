import React, {
  memo,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react'
import { Space, Empty, Segmented, Flex } from 'antd'
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons'
import { filter, includes } from 'lodash'
import { Chart as ChartJS } from 'chart.js'
import { Bar, Line, Bubble, Doughnut, Pie } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm'
import 'chart.js/auto'

import {
  DATE_TYPE_MAP,
  DEFAULT_ALLOWED_TYPES,
  DATE_TYPE_ALLOWED_MAP,
  CHART_COLORS,
  CHART_COLORS2,
} from 'src/libs/chart'
import 'src/libs/chartTotalizer'
import * as styles from './styles'

ChartJS.register(ChartDataLabels)
ChartJS.defaults.plugins.legend.position = 'bottom'
// reverse the default legend toggle logic
// reference: https://stackoverflow.com/a/42565029
// line/area/bar charts only
ChartJS.defaults.plugins.legend.onClick = (event, legendItem, legend) => {
  const index = legendItem.datasetIndex
  const { chart } = legend
  const alreadyHidden =
    chart.getDatasetMeta(index).hidden === null
      ? false
      : chart.getDatasetMeta(index).hidden

  chart.data.datasets.forEach((evt, dIndex) => {
    const meta = chart.getDatasetMeta(dIndex)
    if (dIndex !== index) {
      if (!alreadyHidden) {
        meta.hidden = meta.hidden === null ? !meta.hidden : null
      } else if (meta.hidden === null) {
        meta.hidden = true
      }
    } else if (dIndex === index) {
      meta.hidden = null
    }
  })
  chart.update()
}
ChartJS.defaults.layout.padding = {
  top: 20,
}

export const Chart: React.FC<Resta.Chart.Props> = memo(
  ({
    dateMap,
    dateType = 'd',
    title,
    type,
    style,
    color = '1',
    allowedDateType = DEFAULT_ALLOWED_TYPES,
    handle,
  }) => {
    const [config, setConfig] = useState<Resta.Chart.ChartConfig>(null)
    const [
      selectedDateType = DATE_TYPE_MAP[dateType].value,
      setSelectedDateType,
    ] = useState<Resta.Chart.DateType>()
    const skipRef = useRef(false)
    const isPieChart = type === 'doughnut' || type === 'pie'
    const chartHeight = isPieChart ? 600 : 'auto'

    const colorsMap = useMemo(() => {
      switch (color) {
        case '2':
          return CHART_COLORS2
        case '1':
        default:
          return CHART_COLORS
      }
    }, [color])
    const Component = useMemo(() => {
      switch (type) {
        case 'line':
          return Line
        case 'pie':
          return Pie
        case 'bubble':
          return Bubble
        case 'doughnut':
          return Doughnut
        case 'bar':
        default:
          return Bar
      }
    }, [type])
    const titleIcon = useMemo(() => {
      switch (type) {
        case 'line':
          return <LineChartOutlined />
        case 'doughnut':
        case 'pie':
          return <PieChartOutlined />
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
        const result = await handle?.(dateMap, selectedDateType, colorsMap)
        result && setConfig(result)
      }
      !skipRef.current && process()
      skipRef.current = false
    }, [dateMap, handle, selectedDateType, colorsMap])

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
        <Flex
          css={styles.contentCss}
          align={isPieChart && 'center'}
          style={{ height: chartHeight, ...style }}
          vertical
        >
          {config ? (
            // @ts-expect-error due to dynamic type definition
            <Component options={config.options} data={config.data} />
          ) : (
            <Empty description={false} image={titleIcon} />
          )}
        </Flex>
      </div>
    )
  },
)

export default Chart
