import { useState } from 'react'

type DemoJob = {
  title: string
  org: string
  deadline: string
  status: { text: string; tone: 'today' | 'soon' | 'open' | 'unknown' }
  hasFile: boolean
}

// 화면 예시용 공고. 기관 이름은 ○○로 가렸다.
const JOBS: DemoJob[] = [
  {
    title: '○○점자도서관 점역·교정사 채용',
    org: '○○점자도서관',
    deadline: '11월 6일 (금)',
    status: { text: '오늘 마감', tone: 'today' },
    hasFile: true,
  },
  {
    title: '○○시각장애인복지관 교재 점역 담당 모집',
    org: '○○시각장애인복지관',
    deadline: '11월 9일 (월)',
    status: { text: '3일 남음', tone: 'soon' },
    hasFile: false,
  },
  {
    title: '○○교육청 점자 교과서 교정 보조 인력 채용',
    org: '○○교육청',
    deadline: '11월 20일 (금)',
    status: { text: '14일 남음', tone: 'open' },
    hasFile: true,
  },
  {
    title: '○○출판사 점자 출판 편집자 모집',
    org: '○○출판사',
    deadline: '',
    status: { text: '마감일 확인 필요', tone: 'unknown' },
    hasFile: false,
  },
]

function JobsDemo() {
  const [openTitle, setOpenTitle] = useState<string | null>(null)

  return (
    <div className="demo-jobs">
      <p className="demo-subtle">출처: 점역·교정사 취업정보 게시판. 매일 모아 와요.</p>
      <ul className="demo-job-list" role="list">
        {JOBS.map((job) => {
          const isOpen = openTitle === job.title
          return (
            <li key={job.title} className="demo-job">
              <button
                type="button"
                className="demo-job-head"
                aria-expanded={isOpen}
                onClick={() => setOpenTitle(isOpen ? null : job.title)}
              >
                <span className="demo-job-title">{job.title}</span>
                <span className={`demo-job-status is-${job.status.tone}`}>{job.status.text}</span>
              </button>
              {isOpen && (
                <p className="demo-job-meta">
                  {job.deadline ? `마감일: ${job.deadline} ` : ''}기관: {job.org}
                  {job.hasFile ? ' 첨부파일 있음' : ''}
                  <br />
                  실제 화면에서는 제목을 누르면 원문 공고가 새 창으로 열려요.
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default JobsDemo
