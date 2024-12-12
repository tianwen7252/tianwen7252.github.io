export const WORK_SHIFT = [
  {
    title: '上午',
    key: 'morning',
    startTime: '09:00', // HH:MM
    color: '#fdf4d5',
  },
  // {
  //   title: '中午',
  //   key: 'moon',
  //   startTime: '11:00', // HH:MM
  // },
  {
    title: '下午',
    key: 'afternoon',
    startTime: '13:30', // HH:MM
    color: '#EBF3F7',
  },
]

export function isAMPM(hour) {
  if (hour >= 15) {
    return 'PM'
  }
  return 'AM'
}

export const WORK_SHIFT_REVERSED = [...WORK_SHIFT].reverse()
