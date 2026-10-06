import { Fragment } from 'react'
import { formatKoreanDay } from '../../lib/formatDate'
import type { JobPosting } from '../../types/job'

type JobCardProps = {
  posting: JobPosting
}

// 마감까지 3일 이내면 '곧 마감'으로 눈에 띄게 한다.
const SOON_DAYS = 3

// 상태 칩 하나로 모은다. ('모집중' + '1일 남음' + 마감일을 따로 세 번 보여주지 않는다)
// 'D-4' 대신 글자로 쓴다. 'D-4'는 스크린리더에 따라 '디 마이너스 사'처럼 읽힌다.
// 색만으로 구분하지 않도록 글자 자체가 상태를 말한다.
function getStatus(posting: JobPosting): { text: string; tone: string } {
  if (posting.status !== '모집중' || posting.daysLeft === null) {
    return { text: '마감일 확인 필요', tone: 'unknown' }
  }
  if (posting.daysLeft === 0) return { text: '오늘 마감', tone: 'today' }
  if (posting.daysLeft <= SOON_DAYS) return { text: `${posting.daysLeft}일 남음`, tone: 'soon' }
  return { text: `${posting.daysLeft}일 남음`, tone: 'open' }
}

function JobCard({ posting }: JobCardProps) {
  const status = getStatus(posting)

  // '·' 같은 구분 기호는 소리 내어 읽힐 수 있어서, 이름표(마감일:, 기관:)와 띄어쓰기로만 나눈다.
  const meta = [
    posting.deadline ? `마감일: ${formatKoreanDay(posting.deadline)}` : '',
    posting.org ? `기관: ${posting.org}` : '',
    posting.postedOn ? `작성일: ${formatKoreanDay(posting.postedOn)}` : '',
    `출처: ${posting.board}`,
    posting.hasFile ? '첨부파일 있음' : '',
  ].filter((item) => item !== '')

  return (
    <li className="job-card">
      {/* 제목을 맨 앞에 둔다. 제목(h3)으로 건너뛴 스크린리더 사용자도 바로 뒤에서 상태를 듣는다.
          제목 자체가 링크이고, 새 창으로 열린다는 걸 눈에 보이는 글자로 미리 알린다. */}
      <h3 className="job-card-title">
        <a href={posting.url} target="_blank" rel="noopener noreferrer">
          {posting.title}
          <span className="job-card-new-window"> (새 창 열림)</span>
        </a>
      </h3>

      <p className="job-card-meta">
        <span className={`job-card-status ${status.tone}`}>{status.text}</span>
        {/* 항목 사이에 실제 띄어쓰기를 넣어야 스크린리더가 두 항목을 붙여 읽지 않는다 */}
        {meta.map((item) => (
          <Fragment key={item}>
            {' '}
            <span className="job-card-meta-item">{item}</span>
          </Fragment>
        ))}
      </p>
    </li>
  )
}

export default JobCard
