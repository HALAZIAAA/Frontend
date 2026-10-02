import { useEffect, useState } from 'react'
import JobCard from './JobCard'
import { getJobs } from '../../api/jobApi'
import type { JobPosting } from '../../types/job'
import '../../styles/jobs.css'

// 커뮤니티 '채용공고' 탭의 내용. 게시글이 아니라 외부 게시판에서 모아 온 공고 목록이다.
function JobBoard() {
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

  // 탭을 바꾼 뒤 무엇이 나왔는지 스크린리더가 읽어 주도록 aria-live 영역에 넣는다.
  let statusMessage = `채용공고 ${postings.length}건`
  if (loading) statusMessage = '채용공고를 불러오는 중...'
  else if (error) statusMessage = error
  else if (postings.length === 0) statusMessage = '지금 모집 중인 공고가 없습니다.'

  return (
    <section className="job-board" aria-labelledby="job-board-title">
      <div className="job-board-header">
        <h2 id="job-board-title" className="job-board-title">
          채용공고
        </h2>
        {lastCheckedAt && <p className="job-board-checked">마지막 확인: {lastCheckedAt}</p>}
      </div>

      <p className="job-board-guide">
        한시련 채용/입찰 게시판과 점역·교정사 취업정보 게시판에서 매일 아침 6시에 모아요.
        <br />
        제목을 누르면 원문 사이트가 새 창으로 열려요.
      </p>

      <p className="job-board-status" role="status">
        {statusMessage}
      </p>

      {!loading && !error && postings.length > 0 && (
        <ul className="job-list">
          {postings.map((posting) => (
            <JobCard key={posting.id} posting={posting} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default JobBoard
