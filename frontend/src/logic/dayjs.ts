// NOTE: プラグイン等の設定を引き継ぐため、dayjsを直接importしない (-> @/logic/dayjs.ts)
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ja'

dayjs.extend(timezone)
dayjs.extend(utc)
dayjs.extend(isLeapYear)
dayjs.extend(relativeTime)
dayjs.locale(window.navigator.language)

dayjs.tz.setDefault('Asia/Tokyo')

export default dayjs
