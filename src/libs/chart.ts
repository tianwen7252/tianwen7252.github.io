import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'

import { COLORS } from 'src/constants/defaults/orderTypes'

// reference: https://www.schemecolor.com/
export const CHART_BORDER_COLORS = {
  red: '#ff6384', // 1
  orange: '#ff9f40', //2
  yellow: '#ffcd56', //3
  green: '#4bc0c0', //4
  blue: '#36a2eb', //5
  purple: '#9966ff', //6
  gray: '#c9cbcf', //7
  cinnabar: '#ea4335', //8
  palePink: '#f4d8dd', //9
  pastelPurple: '#b99fb1', //10
  brownSugar: '#b47556', //11
  coffee: '#6d4932', //12
  gunmetal: '#30313c', //13
  armyGreen: '#44501d', //14
  coolGrey: '#8898a7', //15
  chineseSilver: '#c4d0d2', // 16
}
export const CHART_COLORS = {
  red: '#ff638480', // 1
  orange: '#ff9f4080', // 2
  yellow: '#ffc23380', // 3
  green: '#4bc0c080', // 4
  blue: '#37a2eb80', // 5
  purple: '#9966ff80', // 6
  gray: '#c9cbcfd9', // 7
  cinnabar: '#ea433580', // 8
  palePink: '#f4d8dd80', // 9
  pastelPurple: '#b99fb180', // 10
  brownSugar: '#b4755680', // 11
  coffee: '#6d493280', // 12
  gunmetal: '#30313c80', // 13
  armyGreen: '#44501d80', // 14
  coolGrey: '#8898a780', // 15
  chineseSilver: '#c4d0d29e', // 16
}
export const CHART_COLORS2 = {
  chineseWhite: '#D5EAE5', // 1
  columbiaBlue: '#C9DDE7', // 2
  champagne: '#F4E5CA', // 3
  palePink: '#F4D8DD', // 4
  americanSilver: '#CECED0', // 5
  sunray: '#E9B95E', // 6
  tealBlue: '#2D6B8E80', // 7
  skyBlue: '#7BC7EE', // 8
  pastelYellow: '#F4F497', // 9
  deepPeach: '#F6C2A6', // 10
  cottonCandy: '#FBBED6', // 11
  africanViolet: '#B68EC990', // 12
  maximumBlueGreen: '#24DAC5', // 13
  maize: '#F8C058', // 14
  conditioner: '#FEFFC9', // 15
  peru: '#C68642', // 16
}
export const CHART_COLOR_ORDER_TYPES = {
  chineseWhite: '#D5EAE5', // 1
  columbiaBlue: '#C9DDE7', // 2
  champagne: '#F4E5CA', // 3
  palePink: '#F4D8DD', // 4
  americanSilver: '#CECED0', // 5
  purple: `${COLORS.purple}80`, // 6
  blue: `${COLORS.blue}80`, // 7
  gold: `${COLORS.gold}80`, // 8
  red: `${COLORS.red}80`, // 9
  skyBlue: '#7BC7EE', // 10
  cottonCandy: '#FBBED6', // 11
  africanViolet: '#B68EC990', // 12
  maximumBlueGreen: '#24DAC5', // 13
  maize: '#F8C058', // 14
  conditioner: '#FEFFC9', // 15
  peru: '#C68642', // 16
}
export const MONTHS = [
  '一月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '十一月',
  '十二月',
]
export const DATE_TYPE_MAP = {
  d: { label: '日', value: 'd' },
  w: { label: '週', value: 'w' },
  m: { label: '月', value: 'm' },
  q: { label: '季', value: 'q' },
  y: { label: '年', value: 'y' },
} as {
  [date: string]: {
    label: string
    value: Resta.Chart.DateType
  }
}
export const DEFAULT_ALLOWED_TYPES = 'd|w|m|q|y'
export const DATE_TYPE_ALLOWED_MAP = {
  d: ['d', 'w', 'm'],
  w: ['d', 'w', 'm'],
  m: ['w', 'm', 'q', 'y'],
  q: ['m', 'q', 'y'],
  y: ['m', 'q', 'y'],
}
export const HOURS = Array.from(Array(10)).map((none, index) => index + 10)
export const WEEKS = [1, 2, 3, 4, 5]

export function getDateType(dateCount: number) {
  let dateType = 'd'
  if (dateCount <= 7) {
    dateType = 'd'
  } else if (dateCount <= 31) {
    dateType = 'w'
  } else if (dateCount <= 90) {
    dateType = 'm'
  } else if (dateCount <= 180 || dateCount < 365) {
    dateType = 'q'
  } else if (dateCount >= 365) {
    dateType = 'y'
  }
  return dateType
}

export function pickColor(
  index: number,
  colors: Resta.Chart.ColorsMap = CHART_COLORS,
) {
  const keys = Object.keys(colors)
  return colors[keys[index % keys.length]]
}

export function getWeekNumberOfMonth(date: string | Dayjs) {
  const day = date instanceof dayjs ? date : dayjs.tz(date)
  const firstWeekday = day.startOf('M').day()
  const complementedDate = day.date() + firstWeekday
  let weekNumber = Math.floor(complementedDate / 7)
  if (complementedDate % 7 !== 0) {
    ++weekNumber
  }
  return weekNumber
}

export function forEachDateMap(
  dateMap: Resta.Chart.DateMap,
  dateType: Resta.Chart.DateType,
  handle: (
    dateInfo: {
      day: Dayjs
      date: string
      group: string
    },
    index?: number,
  ) => void,
) {
  const dates = Object.keys(dateMap)
  const firstOneYear = dates[0]?.split?.('/')?.[0]
  let allAreSameYear = true
  const labelsSet = new Set<string>()
  let labels: string[]
  dates.forEach((date, index) => {
    const day = dayjs.tz(date)
    const [year, month] = date.split('/')
    let group: string // group means the same date unit of a label in order
    switch (dateType) {
      case 'w': {
        const weeks = getWeekNumberOfMonth(day)
        group = `${year}/${month}/W${weeks}`
        labelsSet.add(group)
        break
      }
      case 'm':
        group = `${year}/${month}月`
        labelsSet.add(group)
        break
      case 'q': {
        const quarterNumber = day.quarter()
        group = `${year}/Q${quarterNumber}`
        labelsSet.add(group)
        break
      }
      case 'y': {
        group = year
        labelsSet.add(group)
        break
      }
      case 'd':
      default: {
        group = date
        break
      }
    }
    if (year !== firstOneYear) {
      allAreSameYear = false
    }
    handle?.(
      {
        day,
        date,
        group,
      },
      index,
    )
  })
  if (dateType === 'd') {
    labels = dates
  } else {
    labels = Array.from(labelsSet)
  }
  return {
    labels:
      allAreSameYear && firstOneYear && dateType !== 'y'
        ? labels.map(each => each.split('/').slice(1).join('/'))
        : labels,
    dates,
  }
}
