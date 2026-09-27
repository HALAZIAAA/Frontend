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
