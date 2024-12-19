export const PM_HOUR = 13
export const PM_MINUTE = 30
export const AM_LABELS = ['AM', '上午']
export const PM_LABELS = ['PM', '下午']
export const TODAY_LABELS = ['TODAY', '今日']
export const LABEL_MAP = {
  [AM_LABELS[0]]: AM_LABELS[1],
  [PM_LABELS[0]]: PM_LABELS[1],
  [TODAY_LABELS[0]]: TODAY_LABELS[1],
}

export const WORK_SHIFT = [
  {
    title: AM_LABELS[1],
    key: AM_LABELS[0],
    startTime: '09:00', // HH:MM
    color: '#fdf4d5',
  },
  // {
  //   title: '中午',
  //   key: 'moon',
  //   startTime: '11:00', // HH:MM
  // },
  {
    title: PM_LABELS[1],
    key: PM_LABELS[0],
    startTime: `${PM_HOUR}:${PM_MINUTE}`, // HH:MM
    // startTime: '13:30', // HH:MM
    color: '#EBF3F7',
  },
]

export function isAMPM(
  hour: number,
  minute: number,
  labelType: 'en' | 'zh' = 'en',
) {
  if (hour >= PM_HOUR && minute >= PM_MINUTE) {
    return labelType === 'en' ? PM_LABELS[0] : PM_LABELS[1]
  }
  return labelType === 'en' ? AM_LABELS[0] : AM_LABELS[1]
}

export const WORK_SHIFT_REVERSED = [...WORK_SHIFT].reverse()
