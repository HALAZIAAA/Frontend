import { Fragment } from 'react'
import type { JobPosting } from '../../types/job'

type JobCardProps = {
  posting: JobPosting
}

// 'D-4' 대신 글자로 쓴다. 'D-4'는 스크린리더에 따라 '디 마이너스 사'처럼 읽힌다.
function getDaysLeftText(daysLeft: number | null): string {
  if (daysLeft === null) return ''
  return daysLeft === 0 ? '오늘 마감' : `${daysLeft}일 남음`
}

function JobCard({ posting }: JobCardProps) {
  const isOpen = posting.status === '모집중'

  // '·' 같은 구분 기호는 소리 내어 읽힐 수 있어서, 이름표(기관:, 작성일:)와 띄어쓰기로만 나눈다.
  const meta = [
    posting.org ? `기관: ${posting.org}` : '',
    posting.postedOn ? `작성일: ${posting.postedOn}` : '',
    posting.deadline ? `마감일: ${posting.deadline}` : '마감일은 원문에서 확인해 주세요',
    posting.hasFile ? '첨부파일 있음' : '',
  ].filter((item) => item !== '')

  return (
    <li className="job-card">
      <div className="job-card-top">
        <span className="job-card-board">{posting.board}</span>
        {/* 상태는 색만으로 구분하지 않고 글자로 쓴다. */}
        {isOpen ? (
          <>
            <span className="job-card-status open">모집중</span>
            <span className="job-card-days-left">{getDaysLeftText(posting.daysLeft)}</span>
          </>
        ) : (
          <span className="job-card-status unknown">마감일 확인 필요</span>
        )}
      </div>

      {/* 제목 자체가 링크다. 새 창으로 열린다는 걸 눈에 보이는 글자로 미리 알린다. */}
      <h3 className="job-card-title">
        <a href={posting.url} target="_blank" rel="noopener noreferrer">
          {posting.title}
          <span className="job-card-new-window"> (새 창 열림)</span>
        </a>
      </h3>

      <p className="job-card-meta">
        {meta.map((item, index) => (
          <Fragment key={item}>
            {index > 0 && ' '}
            <span className="job-card-meta-item">{item}</span>
          </Fragment>
        ))}
      </p>
    </li>
  )
}

export default JobCard
