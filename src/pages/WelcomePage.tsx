import { useRef, type CSSProperties, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@phosphor-icons/react'
import Navbar from '../components/layout/Navbar'
import HeroMotion from '../components/welcome/HeroMotion'
import StorySection, { ProcessSection } from '../components/welcome/StorySection'
import HowItWorksSection from '../components/welcome/HowItWorksSection'
import ArchitectureSection from '../components/welcome/ArchitectureSection'
import ModelSection from '../components/welcome/ModelSection'
import FeatureShowcase from '../components/welcome/FeatureShowcase'
import ResultsSection from '../components/welcome/ResultsSection'
import TeamSection from '../components/welcome/TeamSection'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { useInViewOnce } from '../lib/useInViewOnce'
import { useReveal } from '../lib/useReveal'
import '../styles/navbar.css'
import '../styles/welcome.css'

// 글을 다 읽지 않아도 줄거리가 보이게 맨 위에 두는 숫자 셋. 근거는 아래 '시작된 이야기'와 '현장 검토와 평가'에 있다.
// 점역가 11명은 사용자가 알려 준 참여 인원이다(2026-11-20). Notion 피드백 기록의 1차 참여자 명단에는 10명이 적혀 있다.
// 숫자 옆에는 그 수만큼의 작은 그림을 둔다: 2주는 날짜 칸 14개(두 줄), 3곳은 이어진 점 3개, 11명은 점 11개.
// 띠가 화면에 들어오면 왼쪽 숫자의 그림부터 하나씩 채워진다. turn은 그 숫자의 그림이 채워지기 시작하는 시각(밀리초)이고,
// 앞 그림이 다 채워진 뒤로 잡았다. 그림은 꾸밈이라 화면 읽기 프로그램에는 숨긴다.
const FACTS: Array<{ value: string; label: string; art: 'days' | 'places' | 'people'; count: number; turn: number }> = [
  { value: '2주+', label: '강의자료 한 개를 점자로 바꾸는 시간', art: 'days', count: 14, turn: 200 },
  { value: '3곳', label: '직접 찾아가 인터뷰한 점역 현장', art: 'places', count: 3, turn: 1400 },
  { value: '11명', label: '변환 결과물을 검토한 점역가', art: 'people', count: 11, turn: 2400 },
]

// 바로 가기: 각 섹션 제목(h2)의 id로 이동한다.
const JUMPS: Array<{ id: string; label: string }> = [
  { id: 'welcome-story-title', label: '문제' },
  { id: 'welcome-features-title', label: '기능' },
  { id: 'welcome-how-title', label: '변환 과정' },
  { id: 'welcome-results-title', label: '검토와 평가' },
  { id: 'welcome-arch-title', label: '시스템 구조' },
  { id: 'welcome-model-title', label: 'AI 모델' },
  { id: 'welcome-process-title', label: '만들어 온 과정' },
  { id: 'welcome-team-title', label: '팀' },
]

// 화면에 들어올 때 나타나게 할 요소들 (lib/useReveal.ts)
const REVEAL_TARGETS = [
  '.welcome-hero > *',
  '.welcome-facts li',
  '.welcome-jump',
  '.welcome-section-head',
  '.welcome-story-card',
  '.welcome-kpi',
  '.welcome-round',
  '.welcome-feature-tabs',
  '.welcome-feature-panel',
  '.welcome-feature-more',
  '.welcome-how-step',
  '.welcome-how-note',
  '.welcome-arch-part',
  '.welcome-arch-link',
  '.welcome-folds',
  '.welcome-process-year',
  '.welcome-team-card',
  '.welcome-cta',
].join(', ')

// 바로 가기를 누르면 위에 붙어 있는 메뉴에 제목이 가리지 않는 자리로 옮기고, 포커스도 그 제목으로 보낸다.
function handleJump(event: MouseEvent<HTMLAnchorElement>, id: string) {
  const target = document.getElementById(id)
  if (!target) return
  event.preventDefault()
  const header = document.querySelector('.navbar-wrapper')
  const headerHeight = header && getComputedStyle(header).position === 'sticky' ? header.getBoundingClientRect().height : 0
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({
    top: target.getBoundingClientRect().top + window.scrollY - headerHeight - 16,
    behavior: reduceMotion ? 'auto' : 'smooth',
  })
  target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
}

// 처음 온 사람에게 서비스를 소개하는 화면. 위쪽은 쉬운 말로, 기술 설명은 아래쪽에 둔다.
// 한 줄 소개(움직이는 그림) → 숫자 셋 → 바로 가기 → 문제 → 기능별 화면 예시 → 변환 과정 → 검토와 평가 → 시스템 구조
// → AI 모델 → 만들어 온 과정 → 만드는 사람들 → 시작하기.
function WelcomePage() {
  useDocumentTitle('소개')
  const mainRef = useRef<HTMLElement>(null)
  useReveal(mainRef, REVEAL_TARGETS)
  const [factsRef, factsPlaying] = useInViewOnce<HTMLElement>(0.6)

  return (
    <div className="welcome-wrapper">
      <Navbar />

      <main ref={mainRef} className="page-container welcome-main">
        <div className="welcome-top">
          <section className="welcome-hero" aria-labelledby="welcome-hero-title">
            <p className="welcome-eyebrow">BridgeOn에 오신 걸 환영해요</p>
            <h1 id="welcome-hero-title" className="welcome-hero-title">
              점역가와 학습자를 잇는 <span className="welcome-keep">AI 대체자료 제작 보조 플랫폼</span>
            </h1>
            <p className="welcome-hero-description">
              <strong>강의자료 한 개를 점자로 바꾸는 데 최소 2주가 걸려요.</strong> BridgeOn은 PPT·PDF 강의자료를 올리면
              DOCX·TXT 초안을 만들어요. 그림·표 설명문을 쓰고 점역 지침에도 맞춰요. 점역가(글을 점자로 옮기는 전문가)는
              처음부터 쓰지 않고 검수부터 시작할 수 있어요.
            </p>
            <div className="welcome-hero-actions">
              <Link to="/" className="welcome-primary-button">
                직접 변환해 보기
                <ArrowRightIcon aria-hidden="true" size={18} />
              </Link>
            </div>
            <HeroMotion />
          </section>

          <section
            ref={factsRef}
            className={`welcome-facts ${factsPlaying ? 'is-playing' : ''}`}
            aria-label="한눈에 보기"
          >
            <ul role="list">
              {FACTS.map(({ value, label, art, count, turn }) => (
                <li key={value} className="welcome-fact" style={{ '--turn': `${turn}ms` } as CSSProperties}>
                  <span className="welcome-fact-value">{value}</span>
                  <span className="welcome-fact-label">{label}</span>
                  <span className={`welcome-fact-art is-${art}`} aria-hidden="true">
                    {Array.from({ length: count }, (_, index) => (
                      <span key={index} className="welcome-fact-unit" style={{ '--i': index } as CSSProperties} />
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <nav className="welcome-jump" aria-label="이 화면에서 바로 가기">
            <span className="welcome-jump-label" aria-hidden="true">
              바로 가기
            </span>
            <ul role="list">
              {JUMPS.map(({ id, label }) => (
                <li key={id}>
                  <a href={`#${id}`} className="welcome-jump-link" onClick={(event) => handleJump(event, id)}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <StorySection />

        <FeatureShowcase />

        <HowItWorksSection />

        <ResultsSection />

        <ArchitectureSection />

        <ModelSection />

        <ProcessSection />

        <TeamSection />

        <section className="welcome-cta" aria-labelledby="welcome-cta-title">
          <h2 id="welcome-cta-title" className="welcome-cta-title">
            강의자료 한 개로 시작해 보세요
          </h2>
          <p className="welcome-cta-description">로그인 없이 변환할 수 있어요. 로그인하면 다른 기기에서도 결과를 볼 수 있어요.</p>
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
