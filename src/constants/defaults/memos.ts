export const MEMOS = [
  {
    name: '飯少',
  },
  {
    name: '飯多',
  },
  {
    name: '不要飯',
  },
  {
    name: '不要湯',
  },
  {
    name: '加滷汁',
  },
  {
    name: '電話自取',
    color: 'blue',
  },
  {
    name: '外送訂單',
    color: 'gold',
  },
  {
    name: '優惠價',
    color: 'purple',
  },
  {
    name: '免費',
    color: 'red',
  },
]

export const MEMOS_NAME_COLOR_MAP = MEMOS.reduce(
  (result, { name, color }) => {
    result[name] = color
    return result
  },
  {} as { [name: string]: string },
)

export const HIGHLIGHT_MEMOS = ['電話自取', '外送訂單', '優惠價', '免費']

export const COLORS = {
  red: '#db476c',
  blue: '#546ca3',
  brown: '#9e5e2f',
  purple: '#82379e',
  gold: '#e19338',
}
