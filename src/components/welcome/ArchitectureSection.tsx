import { Fragment } from 'react'
import { ArrowsLeftRightIcon, BrowserIcon, CpuIcon, HardDrivesIcon, type Icon } from '@phosphor-icons/react'

type Part = {
  icon: Icon
  name: string
  role: string
  stack: string[]
}

// 근거: 웹 화면은 package.json, 백엔드 서버는 backend_repo의 requirements.txt와 docker-compose.lightsail.yml,
// AI 서버는 ai_repo의 README와 requirements.txt. AI 서버를 돌리는 곳은 바뀔 수 있어 적지 않는다.
const PARTS: Part[] = [
  {
    icon: BrowserIcon,
    name: '웹 화면',
    role: '파일을 올리고, 진행 상황과 미리보기를 확인한 뒤 결과를 받아요.',
    stack: ['React', 'TypeScript', 'Vite'],
  },
  {
    icon: HardDrivesIcon,
    name: '백엔드 서버',
    role: '문서에서 글과 그림을 꺼내고, 변환 순서를 관리하고, TXT·DOCX를 만들어요.',
    stack: ['FastAPI', 'MySQL', 'PyMuPDF', 'python-pptx', 'python-docx'],
  },
  {
    icon: CpuIcon,
    name: 'AI 서버',
    role: '글자를 인식하고, 그림·표를 설명하고, 원고 구조를 정리해요.',
    stack: ['FastAPI', 'Transformers', '추가 학습한 Qwen3.5-4B'],
  },
]

// 이웃한 두 부분이 주고받는 것. PARTS 사이에 하나씩 들어간다.
const EXCHANGES = ['파일 · 변환 결과', '그림 · 설명문']

function ArchitectureSection() {
  return (
    <section className="welcome-section" aria-labelledby="welcome-arch-title">
      <div className="welcome-section-head">
        <h2 id="welcome-arch-title" className="welcome-section-title">
          시스템 구조와 기술 스택
        </h2>
        <p className="welcome-section-description">웹 화면, 백엔드 서버, AI 서버 세 부분이 자료를 주고받으며 처리해요.</p>
      </div>

      <ol className="welcome-arch" role="list">
        {PARTS.map(({ icon: PartIcon, name, role, stack }, index) => (
          <Fragment key={name}>
            {index > 0 && (
              <li className="welcome-arch-link" aria-hidden="true">
                <ArrowsLeftRightIcon size={24} />
                <span>{EXCHANGES[index - 1]}</span>
              </li>
            )}
            <li className="welcome-arch-part">
              <span className="welcome-arch-head">
                <PartIcon aria-hidden="true" size={24} className="welcome-how-icon" />
                <span className="welcome-how-title">{name}</span>
              </span>
              <span className="welcome-how-description">{role}</span>
              <span className="welcome-arch-stack">
                <span className="sr-only">사용 기술: </span>
                {stack.map((item) => (
                  <span key={item} className="welcome-arch-chip">
                    {item}
                  </span>
                ))}
              </span>
            </li>
          </Fragment>
        ))}
      </ol>

      <p className="welcome-how-note">
        웹 화면은 GitHub Actions로 빌드해 AWS Lightsail에 올려요. 백엔드 서버와 MySQL은 Docker Compose로 실행해요.
      </p>
    </section>
  )
}

export default ArchitectureSection
