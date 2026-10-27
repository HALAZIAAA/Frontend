import {
  ArrowsSplitIcon,
  DownloadSimpleIcon,
  ImageSquareIcon,
  ScanIcon,
  TextIndentIcon,
  UploadSimpleIcon,
  type Icon,
} from '@phosphor-icons/react'

type Step = {
  icon: Icon
  title: string
  tag?: string
  description: string
  highlight?: boolean
}

// 백엔드가 실제로 거치는 단계(추출 → 글자 인식 → 그림 설명 → 원고 정리 → 문서 생성)를 풀어 쓴다.
const STEPS: Step[] = [
  {
    icon: UploadSimpleIcon,
    title: '강의자료 올리기',
    description: 'PPTX나 PDF 강의자료를 올려요. 최대 100MB까지 돼요.',
  },
  {
    icon: ArrowsSplitIcon,
    title: '글과 시각자료 나누기',
    description:
      '문서 속 글과 그림·표·그래프를 따로 꺼내요. 글이 살아 있는 PDF 페이지는 글과 표를 그대로 읽고, 스캔본처럼 그림뿐인 페이지는 페이지를 통째로 이미지로 만들어요.',
  },
  {
    icon: ScanIcon,
    title: '글자 인식(OCR)',
    tag: 'PDF',
    description: '이미지가 된 페이지의 글자를 AI가 읽어 옮겨요. 표가 보이면 칸을 따로 한 번 더 읽어 줄과 칸을 살려요.',
  },
  {
    icon: ImageSquareIcon,
    title: '그림·표 설명',
    tag: 'AI',
    description:
      '시각 언어 모델(VLM)이 그림·표·그래프를 보고 무엇이 담겼는지 설명문 초안을 써요. 그래프라면 축과 값을, 흐름도라면 순서와 방향을 글로 옮기는 식이에요.',
    highlight: true,
  },
  {
    icon: TextIndentIcon,
    title: '점역 형식으로 정리',
    tag: 'AI',
    description:
      'LLM이 본문과 설명문을 합쳐 점역 지침에 맞는 원고로 정리해요. 페이지 표시(@@p), 제목·본문 들여쓰기, [그림 시작]·[그림 끝] 표시를 붙여요.',
  },
  {
    icon: DownloadSimpleIcon,
    title: 'DOCX·TXT로 받기',
    description: '점역가가 바로 검수하고 고칠 수 있는 대체자료 초안을 받아요. 받기 전에 원본과 나란히 미리 볼 수 있어요.',
  },
]

function HowItWorksSection() {
  return (
    <section className="welcome-section" aria-labelledby="welcome-how-title">
      <div className="welcome-section-head">
        <h2 id="welcome-how-title" className="welcome-section-title">
          파일 변환과 그림·표 설명은 이렇게 돼요
        </h2>
        <p className="welcome-section-description">
          글과 시각자료를 나눠 처리한 뒤, 점역 지침에 맞는 원고 하나로 합쳐요.
        </p>
      </div>

      <ol className="welcome-how-steps" role="list">
        {STEPS.map(({ icon: StepIcon, title, tag, description, highlight }, index) => (
          <li key={title} className={`welcome-how-step ${highlight ? 'is-highlight' : ''}`}>
            <span className="welcome-how-head">
              <span className="welcome-how-number" aria-hidden="true">
                {index + 1}
              </span>
              <StepIcon aria-hidden="true" size={22} className="welcome-how-icon" />
              {tag && <span className="welcome-how-tag">{tag === 'PDF' ? 'PDF만' : tag}</span>}
            </span>
            <span className="welcome-how-title">
              <span className="sr-only">{index + 1}단계 </span>
              {title}
            </span>
            <span className="welcome-how-description">{description}</span>
          </li>
        ))}
      </ol>

      <p className="welcome-how-note">
        결과는 완성본이 아니라 <strong>점역가가 검수·수정할 대체자료 초안</strong>이에요. 설명이 정답을 알려 주지는 않는지,
        학습자에게 맞는 길이인지는 점역가가 마지막으로 판단해요.
      </p>
    </section>
  )
}

export default HowItWorksSection
