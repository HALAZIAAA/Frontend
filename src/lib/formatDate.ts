// 백엔드는 ISO UTC 문자열(2026-09-17T05:30:00Z)을 준다. 화면에는 한국 시간으로 보여준다.
const TIME_ZONE = 'Asia/Seoul'

// sv-SE 로케일이 "YYYY-MM-DD" / "YYYY-MM-DD HH:mm" 모양을 그대로 만들어준다.
const DATE_FORMAT = new Intl.DateTimeFormat('sv-SE', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const DATE_TIME_FORMAT = new Intl.DateTimeFormat('sv-SE', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function parse(iso: string | null | undefined): Date | null {
  if (!iso) return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(iso: string | null | undefined): string {
  const date = parse(iso)
  return date ? DATE_FORMAT.format(date) : ''
}

export function formatDateTime(iso: string | null | undefined): string {
  const date = parse(iso)
  return date ? DATE_TIME_FORMAT.format(date).replace(',', '') : ''
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// "2026-10-06" → "10월 6일(화)". 올해가 아니면 연도를 붙인다.
// "2026-10-06"을 스크린리더가 '이천이십육 다시 십…'처럼 읽는 것을 피하려고 우리말 날짜로 쓴다.
export function formatKoreanDay(ymd: string | null | undefined): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(ymd ?? '')
  if (!match) return ''
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  // 시간대 영향을 받지 않도록 그 날짜 자체로 요일을 구한다.
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()]
  const yearPart = year === new Date().getFullYear() ? '' : `${year}년 `
  return `${yearPart}${month}월 ${day}일(${weekday})`
}

// "2026-10-05 17:21" → "10월 5일 17:21"
export function formatKoreanDayTime(ymdHm: string | null | undefined): string {
  const [ymd, hm] = (ymdHm ?? '').split(' ')
  const day = formatKoreanDay(ymd)
  if (!day) return ''
  return hm ? `${day.replace(/\(.\)$/, '')} ${hm}` : day
}
