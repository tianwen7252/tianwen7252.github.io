import { toCurrencyNumber, getCommoditiesInfo } from 'src/libs/common'
import { pickColor, forEachDateMap } from 'src/libs/chart'

const { resMapGroup } = getCommoditiesInfo(undefined, false, true)

export function handleMainDishChart(
  dateMap: Resta.Chart.DateMap,
  dateType: Resta.Chart.DateType,
) {
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
  const { labels } = forEachDateMap(
    dateMap,
    dateType,
    ({ date }, dateIndex) => {
      const { records } = dateMap[date]
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
      })
    },
  )
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
      labels,
      datasets,
    },
  }
}
