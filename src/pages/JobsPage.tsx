import Navbar from '../components/layout/Navbar'
import JobBoard, { JobBoardSummary } from '../components/community/JobBoard'
import { useJobPostings } from '../lib/useJobPostings'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import '../styles/navbar.css'
// 페이지 틀(배경·여백·제목·흰 상자)은 커뮤니티 화면과 같은 스타일을 쓴다.
import '../styles/community.css'

// 한시련 게시판에서 모아 온 채용공고. 게시글이 아니라서 커뮤니티와 따로 둔다.
function JobsPage() {
  useDocumentTitle('채용공고')
  const jobs = useJobPostings()

  return (
    <div className="community-page">
      <Navbar />

      <main className="page-container community-main">
        <h1 className="community-title">채용공고</h1>

        <section className="community-filter-card" aria-label="수집 안내">
          <JobBoardSummary jobs={jobs} />
        </section>

        <JobBoard jobs={jobs} />
      </main>
    </div>
  )
}

export default JobsPage
