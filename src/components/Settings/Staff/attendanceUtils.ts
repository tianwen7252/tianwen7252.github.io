import dayjs from 'dayjs'

// Build a timestamp by combining a date string with time from a dayjs value
export const buildTimestamp = (
  dateStr: string,
  timeValue: dayjs.Dayjs | null | undefined,
): number | undefined => {
  if (!timeValue) return undefined
  return dayjs(dateStr)
    .hour(timeValue.hour())
    .minute(timeValue.minute())
    .second(timeValue.second())
    .valueOf()
}
