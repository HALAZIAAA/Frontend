import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@phosphor-icons/react'
import Navbar from '../components/layout/Navbar'
import StorySection from '../components/welcome/StorySection'
import HowItWorksSection from '../components/welcome/HowItWorksSection'
import FeatureShowcase from '../components/welcome/FeatureShowcase'
import TeamSection from '../components/welcome/TeamSection'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import '../styles/navbar.css'
import '../styles/welcome.css'

// 처음 온 사람에게 서비스를 소개하는 화면: 한 줄 소개 → 시작된 이야기 → 변환 과정 → 기능별 화면 예시 → 만드는 사람들 → 시작하기.
function WelcomePage() {
  useDocumentTitle('소개')
  return (
    <div className="welcome-wrapper">
      <Navbar />

      <main className="page-container welcome-main">
        <section className="welcome-hero" aria-labelledby="welcome-hero-title">
          <p className="welcome-eyebrow">BridgeOn에 오신 걸 환영해요</p>
          <h1 id="welcome-hero-title" className="welcome-hero-title">
            점역가와 학습자를 잇는 <span className="welcome-keep">AI 대체자료 제작 보조 플랫폼</span>
          </h1>
          <p className="welcome-hero-description">
            PPT·PDF 강의자료를 올리면 시각자료 설명문 초안과 점역 지침에 맞춘 DOCX·TXT 초안을 만들어 드려요. 점역가는
            처음부터 쓰지 않고 검수부터 시작할 수 있어요.
          </p>
          <div className="welcome-hero-actions">
            <a href="#welcome-features" className="welcome-secondary-button">
              기능 둘러보기
            </a>
          </div>
        </section>

        <StorySection />

        <HowItWorksSection />

        <FeatureShowcase />

        <TeamSection />

        <section className="welcome-cta" aria-labelledby="welcome-cta-title">
          <h2 id="welcome-cta-title" className="welcome-cta-title">
            강의자료 한 개로 시작해 보세요
          </h2>
          <p className="welcome-cta-description">로그인하지 않아도 변환할 수 있어요. 로그인하면 다른 기기에서도 결과를 볼 수 있어요.</p>
          <Link to="/" className="welcome-primary-button">
            파일 변환하러 가기
            <ArrowRightIcon aria-hidden="true" size={18} />
          </Link>
        </section>
      </main>
    </div>
  )
}

export default WelcomePage
