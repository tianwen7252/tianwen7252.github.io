import dayjs from 'dayjs'

import { getHourFormat } from 'src/libs/common'
import { CHART_COLORS, CHART_BORDER_COLORS, HOURS } from 'src/libs/chart'

export function handleCustomersChart(
  dateMap: Resta.Chart.DateMap,
  chartType: Resta.Chart.ChartType,
) {
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
      backgroundColor: ctx => PM(ctx, CHART_COLORS.blue, CHART_COLORS.yellow),
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
    if (hour === 14 || hour === 15) {
      return `午休 (${getHourFormat(hour, true)})`
    }
    return getHourFormat(hour, true)
  })
  const dates = Object.keys(dateMap)
  dates.forEach(date => {
    const { records } = dateMap[date]
    records.forEach(({ createdAt }) => {
      const day = dayjs.tz(createdAt)
      const hour = day.hour()
      const index = hour - 10
      if (index > -1) {
        const data = datasets[0].data
        data[index] = data[index] ?? 0
        ++data[index]
      }
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
}
