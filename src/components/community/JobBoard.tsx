import JobCard from './JobCard'
import { formatKoreanDayTime } from '../../lib/formatDate'
import type { JobPostingsState } from '../../lib/useJobPostings'
import '../../styles/jobs.css'
import { SkeletonList } from '../common/Skeleton'
import EmptyState from '../common/EmptyState'
import { BriefcaseIcon } from '@phosphor-icons/react'

type JobBoardProps = {
  jobs: JobPostingsState
}

// 채용공고 화면 위쪽 상자에 들어가는 안내문.
// 구분 기호(·)는 소리 내어 읽힐 수 있어서 띄어쓰기로만 나눈다.
export function JobBoardSummary({ jobs }: JobBoardProps) {
  return (
    <div className="job-board-intro">
      <p className="job-board-summary">
        <span className="job-board-count" role="status">
          {jobs.statusMessage}
        </span>{' '}
        <span>한시련 게시판 두 곳에서 매일 아침 6시에 모아요.</span>
        {jobs.lastCheckedAt && (
          <>
            {' '}
            <span>마지막 확인 {formatKoreanDayTime(jobs.lastCheckedAt)}</span>
          </>
        )}
      </p>
      <p className="job-board-guide">제목을 누르면 원문 사이트가 새 창으로 열려요.</p>
    </div>
  )
}

// 채용공고 목록. 게시글이 아니라 외부 게시판에서 모아 온 공고다.
function JobBoard({ jobs }: JobBoardProps) {
  const { postings, loading, error } = jobs

  return (
    <section className="job-board" aria-labelledby="job-board-title">
      {/* 화면 제목(h1) 바로 아래라 눈에는 다시 쓰지 않고, 스크린리더의 제목 구조에만 남긴다 */}
      <h2 id="job-board-title" className="sr-only">
        공고 목록
      </h2>

      {loading && <SkeletonList count={3} lines={2} card label="채용공고를 불러오는 중" />}

      {!loading && !error && postings.length === 0 && (
        <EmptyState
          icon={<BriefcaseIcon size={28} />}
          title="지금 모집 중인 공고가 없어요"
          description="매일 아침 6시에 새 공고를 모아요."
        />
      )}

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
