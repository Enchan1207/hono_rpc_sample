// NOTE: プラグイン等の設定を引き継ぐため、dayjsを直接importしない (-> @/logic/dayjs.ts)

import 'dayjs/locale/ja'

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import dayjs from 'dayjs'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(timezone)
dayjs.extend(utc)
dayjs.extend(isLeapYear)
dayjs.extend(relativeTime)
dayjs.locale(window.navigator.language)

dayjs.tz.setDefault('Asia/Tokyo')

export default dayjs
