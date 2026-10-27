import { useEffect, useState } from 'react'
import { ArrowCounterClockwiseIcon, CheckIcon, FilePdfIcon, FilePptIcon } from '@phosphor-icons/react'

type Sample = {
  name: string
  type: 'pdf' | 'pptx'
  meta: string
  images: number
  tables: number
}

// 화면 흐름을 보여 주기 위한 예시 파일. 실제로 변환하지 않는다.
const SAMPLES: Sample[] = [
  { name: '사회학원론_3주차.pdf', type: 'pdf', meta: 'PDF 24페이지, 8.4MB', images: 9, tables: 2 },
  { name: '세포생물학_세포구조.pptx', type: 'pptx', meta: 'PPTX 18슬라이드, 21.7MB', images: 14, tables: 1 },
  { name: '회계원리_재무제표.pdf', type: 'pdf', meta: 'PDF 32페이지, 3.1MB', images: 3, tables: 11 },
]

// 실제 변환과 같은 단계. PPTX는 글자를 바로 꺼낼 수 있어서 글자 인식을 건너뛴다.
const STEPS = ['추출', '글자 인식', '설명', '정리', '문서 생성']
const STEP_MS = 700

function stepsFor(sample: Sample): string[] {
  return sample.type === 'pdf' ? STEPS : STEPS.filter((step) => step !== '글자 인식')
}

function ConvertDemo() {
  const [sample, setSample] = useState<Sample | null>(null)
  // 지금 진행 중인 단계 번호. 단계 수와 같아지면 완료
  const [step, setStep] = useState(0)

  const steps = sample ? stepsFor(sample) : []
  const done = sample !== null && step >= steps.length

  useEffect(() => {
    if (!sample || done) return
    const timer = window.setTimeout(() => setStep((current) => current + 1), STEP_MS)
    return () => window.clearTimeout(timer)
  }, [sample, step, done])

  const start = (next: Sample) => {
    setSample(next)
    setStep(0)
  }

  if (!sample) {
    return (
      <div className="demo-convert">
        <p className="demo-heading">예시 파일을 골라 변환해 보세요</p>
        <ul className="demo-sample-list" role="list">
          {SAMPLES.map((item) => (
            <li key={item.name}>
              <button type="button" className="demo-sample-button" onClick={() => start(item)}>
                {item.type === 'pdf' ? (
                  <FilePdfIcon aria-hidden="true" size={26} className="demo-file-icon is-pdf" />
                ) : (
                  <FilePptIcon aria-hidden="true" size={26} className="demo-file-icon is-pptx" />
                )}
                <span className="demo-sample-text">
                  <span className="demo-sample-name">{item.name}</span>
                  <span className="demo-sample-meta">{item.meta}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const progress = Math.round((Math.min(step, steps.length) / steps.length) * 100)

  return (
    <div className="demo-convert">
      <p className="demo-heading">{sample.name}</p>
      <p className="demo-subtle">{sample.meta}</p>

      <ol className="demo-steps" role="list">
        {steps.map((label, index) => {
          const state = index < step ? 'done' : index === step ? 'current' : 'upcoming'
          return (
            <li key={label} className={`demo-step is-${state}`}>
              <span className="demo-step-marker" aria-hidden="true">
                {state === 'done' ? <CheckIcon size={14} weight="bold" /> : index + 1}
              </span>
              {label}
            </li>
          )
        })}
      </ol>

      <div className="demo-progress" aria-hidden="true">
        <span className="demo-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <p className="demo-status" role="status">
        {done ? '변환 완료!' : `${steps[step]} 중이에요 (${progress}%)`}
      </p>

      {done && (
        <div className="demo-result">
          <p className="demo-result-text">
            그림 {sample.images}장, 표 {sample.tables}개의 내용을 글로 바꿨어요.
          </p>
          <div className="demo-result-files" aria-hidden="true">
            <span className="demo-file-chip">DOCX</span>
            <span className="demo-file-chip">TXT</span>
          </div>
          <button type="button" className="demo-ghost-button" onClick={() => setSample(null)}>
            <ArrowCounterClockwiseIcon aria-hidden="true" size={18} />
            다른 예시 고르기
          </button>
        </div>
      )}
    </div>
  )
}

export default ConvertDemo
