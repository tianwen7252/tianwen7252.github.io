import { getCommoditiesInfo } from 'src/libs/common'
import { pickColor, forEachDateMap } from 'src/libs/chart'

const { resMapGroup } = getCommoditiesInfo(undefined, false, true)

export function handleOrderDeliveryChart(
  dateMap: Resta.Chart.DateMap,
  dateType: Resta.Chart.DateType,
) {
  if (!dateMap) return null
  const dataList: number[] = []
  const labels = [...resMapGroup['main-dish']]
  forEachDateMap(dateMap, dateType, ({ date }) => {
    const { records } = dateMap[date]
    records.forEach(({ data, memo }) => {
      if (memo?.length && !memo.includes('外送訂單')) {
        return
      }
      data.forEach(({ res, type }) => {
        if (type === 'main-dish') {
          const dataIndex = labels.indexOf(res)
          if (dataIndex > -1) {
            dataList[dataIndex] = (dataList[dataIndex] ?? 0) + 1
          }
        }
      })
    })
  })
  const datasets = [
    {
      data: dataList,
      backgroundColor: labels.map((label, index) => pickColor(index)),
      datalabels: {
        formatter(value) {
          const sum = dataList.reduce((result, each) => {
            return result + each
          }, 0)
          const percentage = ((value / sum) * 100).toFixed(1)
          return `${value}份 (${percentage}%)`
        },
      },
    },
  ]
  return {
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label(context) {
              return `${context.parsed}份`
            },
          },
        },
      },
    },
    data: {
      labels,
      datasets,
    },
  }
}
