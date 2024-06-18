import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/zh-tw'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('zh-tw')
dayjs.extend(relativeTime)
dayjs.tz.setDefault() // 'Asia/Taipei'

export { dayjs }
