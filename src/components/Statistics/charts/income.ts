import { toCurrency } from 'src/libs/common'
import { CHART_COLORS, forEachDateMap } from 'src/libs/chart'

export function handleIncomeChart(
  dateMap: Resta.Chart.DateMap,
  dateType: Resta.Chart.DateType,
) {
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
  const datasetTotal: {
    [group: string]: number
  } = {}
  const AMTotal: {
    [group: string]: number
  } = {}
  const PMTotal: {
    [group: string]: number
  } = {}
  const { labels } = forEachDateMap(
    dateMap,
    dateType,
    ({ date, group }, index) => {
      const { records, dailyData } = dateMap[date]
      records.forEach(({ total, $isAM }) => {
        if ($isAM) {
          AMTotal[group] = (AMTotal[group] ?? 0) + total
        } else {
          PMTotal[group] = (PMTotal[group] ?? 0) + total
        }
      })
      datasetTotal[group] = (datasetTotal[group] ?? 0) + dailyData.total
    },
  )
  const totalData = Object.values(datasetTotal)
  datasets[0].data = Object.values(AMTotal)
  datasets[1].data = Object.values(PMTotal)
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
            const total = totalData[context.dataIndex]
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
      labels,
      datasets,
    },
  }
}
