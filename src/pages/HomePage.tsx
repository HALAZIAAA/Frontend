import { DownloadSimpleIcon, ScanIcon, UploadSimpleIcon, type Icon } from '@phosphor-icons/react'
import Navbar from '../components/layout/Navbar'
import HeroSection from '../components/home/HeroSection'
import UploadSection from '../components/home/UploadSection'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import '../styles/navbar.css'
import '../styles/home.css'

// 백엔드가 실제로 거치는 단계. (추출 → 글자 인식·그림 설명 → 문서 생성)
const CONVERSION_STEPS: Array<{ icon: Icon; title: string; description: string }> = [
  {
    icon: UploadSimpleIcon,
    title: '파일 올리기',
    description: 'PDF나 PPTX 강의자료를 올려요. 최대 100MB까지 돼요.',
  },
  {
    icon: ScanIcon,
    title: '글자 인식과 그림·표 설명',
    description: '페이지의 글자를 읽고, 그림과 표는 AI가 글로 풀어 설명해요.',
  },
  {
    icon: DownloadSimpleIcon,
    title: 'DOCX·TXT 받기',
    description: '스크린리더로 읽거나 점역에 바로 쓸 수 있는 파일로 받아요.',
  },
]

function HomePage() {
  useDocumentTitle('파일 변환')
  return (
    <div className="homepage-wrapper">
      <Navbar />

      {/* 변환 도구가 주인공: 가운데 한 줄로 소개 → 업로드 상자 → 변환 과정.
          화면 크기와 상관없이 같은 순서라 보이는 순서 = 읽는 순서다. */}
      <main className="page-container home-main-content">
        <HeroSection
          title="자료를 누구나 읽을 수 있는 문서로"
          description="PDF·PPTX를 올리면 그림과 표를 글로 설명한 DOCX·TXT 파일로 바꿔요."
        />

        <div className="home-upload-area">
          <UploadSection />
        </div>

        <section className="home-steps" aria-labelledby="home-steps-title">
          <h2 id="home-steps-title" className="home-steps-title">
            변환 과정
          </h2>
          {/* list-style을 없애면 Safari VoiceOver가 목록으로 읽지 않아서 role="list"를 다시 준다 */}
          <ol className="home-steps-list" role="list">
            {CONVERSION_STEPS.map(({ icon: StepIcon, title, description }) => (
              <li key={title} className="home-step">
                <span className="home-step-icon" aria-hidden="true">
                  <StepIcon size={22} />
                </span>
                <span className="home-step-text">
                  <span className="home-step-title">{title}</span>
                  <span className="home-step-description">{description}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  )
}

export default HomePage
