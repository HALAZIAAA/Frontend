// 커뮤니티 '채용공고' 탭. 외부 게시판(한시련)에서 매일 모아 온 공고다.
export type JobStatus = '모집중' | '미확인'

export interface JobPosting {
  id: number
  source: string
  board: string // 출처 게시판 이름 (예: "점역·교정사 취업정보")
  title: string
  url: string // 원문 주소. 새 창으로 연다.
  org: string | null // 공고를 낸 기관. 못 알아내면 null
  postedOn: string | null // "YYYY-MM-DD"
  deadline: string | null // "YYYY-MM-DD". 미확인이면 null
  status: JobStatus
  daysLeft: number | null // 모집중일 때 마감까지 남은 날 (오늘 마감이면 0)
  hasFile: boolean
}

export interface JobListResult {
  postings: JobPosting[]
  lastCheckedAt: string // "YYYY-MM-DD HH:mm" (한국시간). 아직 한 번도 수집하지 못했으면 ''
}
