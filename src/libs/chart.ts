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
export const HOURS = Array.from(Array(10)).map((none, index) => index + 10)

export function pickColor(index: number, colors = CHART_COLORS) {
  const keys = Object.keys(colors)
  return colors[keys[index % keys.length]]
}
