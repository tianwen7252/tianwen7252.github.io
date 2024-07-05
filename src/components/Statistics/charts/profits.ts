import { toCurrency } from 'src/libs/common'
import { CHART_COLORS, forEachDateMap } from 'src/libs/chart'

export function handleProfitsChart(
  dateMap: Resta.Chart.DateMap,
  dateType: Resta.Chart.DateType,
) {
  if (!dateMap) return null
  const datasets = [
    {
      label: '營收',
      data: [],
      backgroundColor: CHART_COLORS.orange,
    },
    {
      label: '成本',
      data: [],
      backgroundColor: CHART_COLORS.chineseSilver,
    },
    {
      label: '淨利',
      data: [],
      backgroundColor: CHART_COLORS.green,
    },
  ]
  const datasetTotal: Resta.Chart.GroupData = {}
  const AMTotal: Resta.Chart.GroupData = {}
  const PMTotal: Resta.Chart.GroupData = {}
  const { labels } = forEachDateMap(dateMap, dateType, ({ date, group }) => {
    const { records, dailyData } = dateMap[date]
    records.forEach(({ total, $isAM }) => {
      if ($isAM) {
        AMTotal[group] = (AMTotal[group] ?? 0) + total
      } else {
        PMTotal[group] = (PMTotal[group] ?? 0) + total
      }
    })
    datasetTotal[group] = (datasetTotal[group] ?? 0) + dailyData.total
  })
  const totalData = Object.values(datasetTotal)
  datasets[0].data = totalData
  datasets[1].data = Object.values(AMTotal) // fake temporarily
  datasets[2].data = Object.values(PMTotal) // fake temporarily
  return {
    options: {
      responsive: true,
      plugins: {
        datalabels: {
          anchor: 'end',
          align: 'end',
          formatter(value) {
            return toCurrency(value)
          },
          // display(context) {
          //   return context.datasetIndex === 1
          // },
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
