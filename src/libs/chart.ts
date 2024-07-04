import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'

export const CHART_BORDER_COLORS = {
  red: '#ff6384',
  orange: '#ff9f40',
  yellow: '#ffcd56',
  green: '#4bc0c0',
  blue: '#36a2eb',
  purple: '#9966ff',
  gray: '#c9cbcf',
  cinnabar: '#ea4335',
  palePink: '#f4d8dd',
  pastelPurple: '#b99fb1',
  brownSugar: '#b47556',
  coffee: '#6d4932',
  gunmetal: '#30313c',
  armyGreen: '#44501d',
  coolGrey: '#8898a7',
  chineseSilver: '#c4d0d2',
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

export function pickColor(index: number, colors = CHART_COLORS) {
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
    let group: string
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
