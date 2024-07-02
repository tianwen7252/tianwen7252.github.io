import { Chart } from 'chart.js'

export const totalizer = {
  id: 'totalizer',

  beforeUpdate: (chart, args, options) => {
    const totals = {}
    let utmost = 0
    if (options.calculate === true) {
      chart.data.datasets.forEach((dataset, datasetIndex) => {
        if (chart.isDatasetVisible(datasetIndex)) {
          utmost = datasetIndex
          dataset.data.forEach((value, index) => {
            totals[index] = (totals[index] || 0) + value
          })
        }
      })
    }
    chart.$totalizer = {
      totals: totals,
      utmost: utmost,
    }
  },
}

Chart.register(totalizer)

// usage example, ref https://stackoverflow.com/questions/50601605/how-can-i-datalabels-and-sum-display-in-the-same-time-on-a-stacked-bar
// datalabels: {
//   formatter: (value, ctx) => {
//     const total = ctx.chart.$totalizer.totals[ctx.dataIndex]
//     return total.toLocaleString('zh-TW', {})
//   },
//   align: 'end',
//   anchor: 'end',
//   display: function(ctx) {
//     return ctx.datasetIndex === ctx.chart.$totalizer.utmost
//   }
// }
