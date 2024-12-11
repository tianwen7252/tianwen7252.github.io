export const ORDER_TYPES = [
  {
    name: '飯少',
    priority: 1,
    type: 'meal',
  },
  {
    name: '飯多',
    priority: 2,
    type: 'meal',
  },
  {
    name: '不要飯',
    priority: 3,
    type: 'meal',
  },
  {
    name: '不要湯',
    priority: 4,
    type: 'meal',
  },
  {
    name: '加滷汁',
    priority: 5,
    type: 'meal',
  },
  {
    name: '優惠價',
    color: 'purple',
    priority: 6,
    type: 'order',
  },
  {
    name: '電話自取',
    color: 'blue',
    priority: 7,
    type: 'order',
  },
  {
    name: '外送',
    color: 'gold',
    priority: 8,
    type: 'order',
  },
  {
    name: '攤位',
    color: 'red',
    priority: 9,
    type: 'order',
  },
] as RestaDB.Table.OrderType[]

export const ORDER_TYPES_NAME_COLOR_MAP = ORDER_TYPES.reduce(
  (result, { name, color }) => {
    result[name] = color
    return result
  },
  {} as { [name: string]: string },
)

export const ORDER_TYPES_OPTIONS = [
  ...ORDER_TYPES.map(({ name }) => ({
    label: name,
    value: name,
  })),
  {
    label: '水餃',
    value: '水餃',
  },
  {
    label: '湯',
    value: '湯',
  },
]

export const COLORS = {
  red: '#db476c',
  blue: '#546ca3',
  brown: '#9e5e2f',
  purple: '#82379e',
  gold: '#e19338',
}
