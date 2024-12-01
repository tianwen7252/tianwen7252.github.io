import { useMemo } from 'react'

import { toCurrencyNumber } from 'src/libs/common'
import { pickColor, forEachDateMap } from 'src/libs/chart'

export function processResChart(
  resType: 'main-dish' | 'à-la-carte' | 'others',
  dateMap: Resta.Chart.DateMap,
  chartType: Resta.Chart.ChartType,
  dateType: Resta.Chart.DateType,
  colorsMap: Resta.Chart.ColorsMap,
  resMapGroup: Resta.Commodity.ResMapGroup,
) {
  if (!dateMap) return null
  const groupData: {
    [res: string]: {
      [group: string]: number
    }
  } = {}
  const { labels } = forEachDateMap(dateMap, dateType, ({ date, group }) => {
    const { records } = dateMap[date]
    records.forEach(({ data }) => {
      data.forEach(({ res, type }) => {
        if (type === resType) {
          groupData[res] = groupData[res] ?? {}
          groupData[res][group] = (groupData[res][group] ?? 0) + 1
        }
      })
    })
  })
  const datasets = resMapGroup[resType].map((label, index) => {
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
        tooltip: {
          callbacks: {
            label(context) {
              return `${context.dataset.label + ': ' || ''}${context.parsed.y}份`
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

export function useHandleResChart(type: 'main-dish' | 'à-la-carte' | 'others') {
  return useMemo(() => processResChart.bind(null, type), [type])
}
