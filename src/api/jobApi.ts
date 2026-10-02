import { BACKEND_ORIGIN } from './fileApi'
import { formatDateTime } from '../lib/formatDate'
import type { JobListResult, JobPosting, JobStatus } from '../types/job'

const API_BASE = `${BACKEND_ORIGIN}/api/v1/jobs`
const LOAD_FAILED = '채용공고를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'

// 백엔드는 snake_case로 준다. 변환은 이 파일 안에서만 한다.
type RawJobPosting = {
  id: number
  source: string
  board: string
  title: string
  url: string
  org: string | null
  posted_on: string | null
  deadline: string | null
  status: string
  days_left: number | null
  has_file: boolean
}

type RawJobList = {
  postings: RawJobPosting[]
  last_checked_at: string | null
}

function toJobPosting(raw: RawJobPosting): JobPosting {
  return {
    id: raw.id,
    source: raw.source,
    board: raw.board,
    title: raw.title,
    url: raw.url,
    org: raw.org,
    postedOn: raw.posted_on,
    deadline: raw.deadline,
    status: raw.status as JobStatus,
    daysLeft: raw.days_left,
    hasFile: raw.has_file,
  }
}

// 지금 지원할 수 있는 채용공고 (모집중 → 마감일 미확인 순). 로그인 없이 볼 수 있다.
export async function getJobs(): Promise<JobListResult> {
  let res: Response
  try {
    res = await fetch(API_BASE)
  } catch {
    // 서버가 꺼져 있으면 브라우저가 영어 메시지(Failed to fetch)를 주므로 우리 문구로 바꾼다.
    throw new Error(LOAD_FAILED)
  }
  if (!res.ok) {
    throw new Error(LOAD_FAILED)
  }

  const raw = (await res.json()) as RawJobList
  return {
    postings: raw.postings.map(toJobPosting),
    lastCheckedAt: formatDateTime(raw.last_checked_at),
  }
}
