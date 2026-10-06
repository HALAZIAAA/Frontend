import { useEffect, useState } from 'react'
import { getJobs } from '../api/jobApi'
import type { JobPosting } from '../types/job'

// 채용공고 화면의 데이터. 위쪽 안내 상자와 아래 목록이 같이 쓰도록 화면에서 한 번만 불러온다.
export function useJobPostings() {
  const [postings, setPostings] = useState<JobPosting[]>([])
  const [lastCheckedAt, setLastCheckedAt] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    getJobs()
      .then((result) => {
        if (cancelled) return
        setPostings(result.postings)
        setLastCheckedAt(result.lastCheckedAt)
        setError('')
      })
      .catch((err) => {
        if (cancelled) return
        setPostings([])
        setError(err instanceof Error ? err.message : '채용공고를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // 불러온 뒤 무엇이 나왔는지 스크린리더가 읽어 주도록 aria-live 영역에 넣는 문장
  let statusMessage = `채용공고 ${postings.length}건`
  if (loading) statusMessage = '채용공고를 불러오는 중...'
  else if (error) statusMessage = error
  else if (postings.length === 0) statusMessage = '지금 모집 중인 공고가 없습니다.'

  return { postings, lastCheckedAt, loading, error, statusMessage }
}

export type JobPostingsState = ReturnType<typeof useJobPostings>
