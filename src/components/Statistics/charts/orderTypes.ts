import { toCurrencyNumber } from 'src/libs/common'
import { pickColor, forEachDateMap } from 'src/libs/chart'
import { MEMOS } from 'src/constants/defaults/memos'

export function handleOrderTypes(
  dateMap: Resta.Chart.DateMap,
  dateType: Resta.Chart.DateType,
  colorsMap: Resta.Chart.ColorsMap,
) {
  if (!dateMap) return null
  const groupData: {
    [item: string]: {
      [group: string]: number
    }
  } = {}
  const { labels } = forEachDateMap(dateMap, dateType, ({ date, group }) => {
    const { records } = dateMap[date]
    records.forEach(({ memo }) => {
      if (memo?.length) {
        memo.forEach(item => {
          groupData[item] = groupData[item] ?? {}
          groupData[item][group] = (groupData[item][group] ?? 0) + 1
        })
      }
    })
  })
  const datasets = MEMOS.map(({ name: label }, index) => {
    return {
      label,
      data: Object.values(groupData[label] ?? {}),
      backgroundColor: pickColor(index, colorsMap),
      stack: 'stack 0',
      datalabels: {
        formatter(value, ctx) {
          let sum = 0
          ctx.chart.data.datasets.forEach(dataset => {
            sum += dataset.data[ctx.dataIndex] ?? 0 // turn undefined to 0
          })
          const percentage = ((value / sum) * 100).toFixed(1)
          return `${percentage}%`
        },
      },
    }
  })
  datasets.push({
    label: 'Total',
    data: [...Array.from(Array(labels.length)).map(() => 0)], // 0 are just placeholders
    datalabels: {
      // @ts-expect-error expected
      align: 'end',
      anchor: 'end',
      formatter(value, ctx) {
        let sum = 0
        ctx.chart.data.datasets.forEach(dataset => {
          sum += dataset.data[ctx.dataIndex] ?? 0 // turn undefined to 0
        })
        return toCurrencyNumber(sum)
      },
    },
    stack: 'stack 0',
  })
  return {
    options: {
      indexAxis: 'y',
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
