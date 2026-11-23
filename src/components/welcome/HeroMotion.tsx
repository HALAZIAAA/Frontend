import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowCounterClockwiseIcon, ArrowRightIcon } from '@phosphor-icons/react'

// 한 줄 소개 아래의 움직이는 그림: 강의자료 한 쪽이 점역 원고 초안으로 바뀌는 과정을 5초 안에 한 번 보여 준다.
// 실제 변환을 녹화한 영상이 아니라 예시 자료로 그린 그림이다. 내용은 '그림·표 설명' 예시의 막대그래프와 같다.
// 움직임은 welcome.css의 hm-* 규칙이 맡고, '동작 줄이기'를 켠 사용자에게는 다 그려진 모습만 보인다.
const BARS: Array<[string, number]> = [
  ['1학년', 12],
  ['2학년', 18],
  ['3학년', 25],
  ['4학년', 9],
]

const LINES: Array<{ text: string; kind?: 'page' | 'title' | 'boundary' }> = [
  { text: '@@p5', kind: 'page' },
  { text: '        학년별 도서관 이용', kind: 'title' },
  { text: '[그림 시작]', kind: 'boundary' },
  { text: '  학년별 한 달 평균 도서관 이용 횟수를 나타낸 세로 막대그래프' },
  { text: '  1학년 12회, 2학년 18회, 3학년 25회, 4학년 9회로 3학년이 가장 많고 4학년이 가장 적다.' },
  { text: '[그림 끝]', kind: 'boundary' },
]

// 요소마다 몇 번째인지 알려 줘서 CSS가 순서대로 늦게 움직이게 한다.
const order = (index: number) => ({ '--i': index }) as CSSProperties

function HeroMotion() {
  const ref = useRef<HTMLElement>(null)
  // 그림이 화면에 들어왔을 때 움직이기 시작한다. IntersectionObserver가 없으면 바로 시작한다.
  const [playing, setPlaying] = useState(() => typeof IntersectionObserver === 'undefined')
  const [run, setRun] = useState(0) // '다시 보기'를 누를 때마다 그림을 새로 그려 처음부터 다시 움직인다

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setPlaying(true)
        observer.disconnect()
      },
      { threshold: 0.35 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const replay = () => {
    setPlaying(true)
    setRun((count) => count + 1)
  }

  return (
    <figure className="hero-motion" ref={ref}>
      <div
        key={run}
        className={`hm-stage ${playing ? 'is-playing' : ''}`}
        role="img"
        aria-label="강의자료 한 쪽의 제목과 막대그래프가 페이지 표시, 제목, 그림 설명이 들어간 글 원고로 바뀌는 과정을 보여 주는 그림"
      >
        <div className="hm-pane">
          <p className="hm-pane-label">강의자료 한 쪽</p>
          <div className="hm-slide">
            <svg viewBox="0 0 320 200" className="hm-chart">
              <text x="160" y="22" textAnchor="middle" className="svg-title">
                학년별 도서관 이용
              </text>
              <line x1="40" y1="170" x2="300" y2="170" className="svg-axis" />
              <line x1="40" y1="40" x2="40" y2="170" className="svg-axis" />
              {BARS.map(([label, value], index) => {
                const x = 62 + index * 60
                const height = value * 4.4
                return (
                  <g key={label}>
                    <rect x={x} y={170 - height} width="36" height={height} rx="3" className="svg-bar hm-bar hm-a" style={order(index)} />
                    <text x={x + 18} y={164 - height} textAnchor="middle" className="svg-small hm-bar-value hm-a">
                      {value}회
                    </text>
                    <text x={x + 18} y="188" textAnchor="middle" className="svg-small">
                      {label}
                    </text>
                  </g>
                )
              })}
            </svg>
            <span className="hm-scan hm-a" />
          </div>
        </div>

        <div className="hm-link hm-a">
          <span>AI가 초안 작성</span>
          <ArrowRightIcon size={28} weight="bold" className="hm-link-arrow" />
        </div>

        <div className="hm-pane">
          <p className="hm-pane-label">점역 원고 초안 (TXT)</p>
          <div className="demo-txt">
            {LINES.map(({ text, kind }, index) => (
              <span key={text} className={`hm-line hm-a ${kind ? `demo-txt-${kind}` : ''}`} style={order(index)}>
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      <figcaption className="hm-caption">
        변환 과정을 예시 자료로 나타낸 그림이에요.
        <button type="button" className="hm-replay" onClick={replay}>
          <ArrowCounterClockwiseIcon aria-hidden="true" size={16} weight="bold" />
          다시 보기
        </button>
      </figcaption>
    </figure>
  )
}

export default HeroMotion
