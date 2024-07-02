import React, { memo, useEffect, useState, useMemo } from 'react'
import { Space, Empty } from 'antd'
import { BarChartOutlined, LineChartOutlined } from '@ant-design/icons'
import { Chart as ChartJS } from 'chart.js'
import { Bar, Line, Bubble } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm'
import 'chart.js/auto'

import 'src/libs/chartTotalizer'
import * as styles from './styles'

ChartJS.register(ChartDataLabels)

export const Chart: React.FC<Resta.Chart.Props> = memo(
  ({ dateMap, handle, title, type }) => {
    const [config, setConfig] = useState<Resta.Chart.ChartConfig>(null)

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

    useEffect(() => {
      const process = async () => {
        const result = await handle?.(dateMap)
        result && setConfig(result)
      }
      process()
    }, [dateMap, handle])

    return (
      <div css={styles.chartCss}>
        <Space css={styles.chartLabel}>
          {titleIcon}
          <label>{title}</label>
        </Space>
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
