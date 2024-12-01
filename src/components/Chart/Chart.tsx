import React, {
  memo,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  useContext,
} from 'react'
import { Space, Empty, Segmented, Flex } from 'antd'
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TableOutlined,
} from '@ant-design/icons'
import { filter, includes, uniq } from 'lodash'
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
import { AppContext } from 'src/pages/App/context'

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
    displayTypes = '**|doughnut|table', // ** means default chart type (props.type)
    handle,
  }) => {
    const { getAllCommoditiesInfo } = useContext(AppContext)
    const [config, setConfig] = useState<Resta.Chart.ChartConfig>(null)
    const [selectedDateType = DATE_TYPE_MAP[dateType].value, setDateType] =
      useState<Resta.Chart.DateType>()
    const [selectedChartType, setChartType] = useState(type)
    const skipRef = useRef(false)
    const isPieChart = type === 'doughnut' || type === 'pie'
    const chartHeight = isPieChart ? 600 : 'auto'

    const chartTypes = useMemo(() => {
      return (
        displayTypes &&
        uniq(displayTypes.trim().replace('**', type).split('|')).map(value => ({
          label: getChartIcon(value),
          value,
        }))
      )
    }, [type, displayTypes])
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
    const titleIcon = useMemo(() => getChartIcon(type), [type])
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

    const onChangeChartType = useCallback((value: Resta.Chart.ChartType) => {
      setChartType(value)
    }, [])
    const onChangeDateType = useCallback((value: Resta.Chart.DateType) => {
      setDateType(value)
    }, [])

    useEffect(() => {
      // if the user change the date range
      if (
        dateTypeOptions.length &&
        !dateTypeOptions.some(({ value }) => value === selectedDateType)
      ) {
        skipRef.current = true // skip running process because the new date will be coming afterwards
        setDateType(dateTypeOptions[0].value)
      }
    }, [dateTypeOptions, selectedDateType])

    useEffect(() => {
      const process = async () => {
        const { resMapGroup } = await getAllCommoditiesInfo()
        const result = await handle?.(
          dateMap,
          selectedChartType,
          selectedDateType,
          colorsMap,
          resMapGroup,
        )
        result && setConfig(result)
      }
      !skipRef.current && process()
      skipRef.current = false
    }, [
      dateMap,
      handle,
      selectedDateType,
      selectedChartType,
      colorsMap,
      getAllCommoditiesInfo,
    ])

    return (
      <div css={styles.chartCss}>
        <Flex css={styles.headerCss}>
          <Space css={styles.labelCss}>
            {titleIcon}
            <label>{title}</label>
          </Space>
          {chartTypes && config && (
            <Segmented
              options={chartTypes}
              value={selectedChartType}
              onChange={onChangeChartType}
            />
          )}
          {allowedDateType ? (
            <Segmented
              options={dateTypeOptions}
              value={selectedDateType}
              onChange={onChangeDateType}
            />
          ) : (
            <div style={{ width: 112 }}></div> // placeholder
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

export function getChartIcon(type: string) {
  switch (type) {
    case 'line':
      return <LineChartOutlined />
    case 'doughnut':
    case 'pie':
      return <PieChartOutlined />
    case 'table':
      return <TableOutlined />
    case 'bar':
    default:
      return <BarChartOutlined />
  }
}

export default Chart
