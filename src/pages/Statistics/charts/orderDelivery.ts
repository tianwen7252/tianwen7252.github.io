import { pickColor, forEachDateMap } from 'src/libs/chart'

export function handleOrderDeliveryChart(
  dateMap: Resta.Chart.DateMap,
  chartType: Resta.Chart.ChartType,
  dateType: Resta.Chart.DateType,
  colorsMap: Resta.Chart.ColorsMap,
  resMapGroup: Resta.Commodity.ResMapGroup,
) {
  if (!dateMap) return null
  const dataList: number[] = []
  const labels = [...resMapGroup['main-dish']]
  forEachDateMap(dateMap, dateType, ({ date }) => {
    const { records } = dateMap[date]
    records.forEach(({ data, memo }) => {
      if (memo?.length && !memo.includes('外送')) {
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
      backgroundColor: labels.map((label, index) =>
        pickColor(index, colorsMap),
      ),
      datalabels: {
        formatter(value) {
          if (value === undefined) return ''
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
