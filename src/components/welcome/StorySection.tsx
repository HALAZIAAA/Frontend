import type { ReactNode } from 'react'
import {
  ArrowRightIcon,
  BooksIcon,
  BuildingsIcon,
  ChatTextIcon,
  ChatsCircleIcon,
  ChartLineIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  DatabaseIcon,
  FileTextIcon,
  GraduationCapIcon,
  GraphIcon,
  HandshakeIcon,
  ImageIcon,
  PencilSimpleLineIcon,
  QuestionIcon,
  ScanIcon,
  TableIcon,
  TextAlignLeftIcon,
  TextTIcon,
} from '@phosphor-icons/react'
// 로고 출처: 위키미디어 공용 File:Qwen_Logo.svg(Alibaba Cloud), File:Gemma_icon.png(Google DeepMind). 둘 다 Apache License 2.0
import qwenLogo from '../../assets/welcome/qwen-logo.svg'
import gemmaIcon from '../../assets/welcome/gemma-icon.png'

type Milestone = {
  when: string
  dateTime?: string // <time>에 넣는 기계용 날짜. 학기처럼 날짜로 못 쓰면 비운다.
  title: string
  description: string
  visual: ReactNode // 왼쪽 그림. 설명은 오른쪽 글에 다 있으므로 스크린리더에는 숨긴다.
}

// 그림 칸 안의 '아이콘 + 짧은 이름' 한 묶음
function Tile({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="process-tile">
      {icon}
      <span className="process-tile-label">{label}</span>
    </span>
  )
}

const Arrow = () => <ArrowRightIcon size={20} className="process-arrow" />

// 날짜 근거: 2025년은 2학기 중간 발표 자료·대본(11/4 발표), 2026년은 개발과정 정리 문서(01_문서/2026-08-11_개발과정_전체정리.md)
// 깃허브 개발 시작일은 저장소를 새로 만들면서 2026년으로 남아 있어서 넣지 않는다.
const YEARS: Array<{ year: string; tone: 'early' | 'build'; items: Milestone[] }> = [
  {
    year: '2025',
    tone: 'early',
    items: [
      {
        when: '2025년 2학기',
        title: '장애학생지원센터의 의뢰로 프로젝트 시작',
        description: '충북대학교 장애학생지원센터의 의뢰가 BridgeOn의 출발점이에요.',
        visual: (
          <>
            <Tile icon={<GraduationCapIcon size={34} />} label="장애학생지원센터" />
            <Arrow />
            <Tile icon={<HandshakeIcon size={34} />} label="의뢰" />
          </>
        ),
      },
      {
        when: '2025년 9월 23일',
        dateTime: '2025-09-23',
        title: '장애학생지원센터 면담',
        description:
          '강의자료 한 개를 점자로 바꾸는 데 최소 2주가 걸리고, 학기 초에 요청이 몰려 인력과 시간이 모자란다는 걸 확인했어요.',
        visual: (
          <span className="process-stat">
            <ChatsCircleIcon size={28} />
            <span className="process-stat-number">2주+</span>
            <span className="process-tile-label">강의자료 1개 점자 변환</span>
          </span>
        ),
      },
      {
        when: '2025년 11월 4일',
        dateTime: '2025-11-04',
        title: 'AI 실험과 중간 발표',
        description:
          '한국어에 강점을 가진 오픈소스 VLM으로 글, 사진, 표, 복잡한 그림, 그래프가 든 강의자료 5가지를 직접 돌려 보고 결과를 발표했어요. 복잡한 그림 설명과 한 페이지에 1~10분 걸리는 속도가 다음 과제로 남았어요.',
        visual: (
          <span className="process-tile-row">
            <Tile icon={<TextTIcon size={22} />} label="글" />
            <Tile icon={<ImageIcon size={22} />} label="사진" />
            <Tile icon={<TableIcon size={22} />} label="표" />
            <Tile icon={<GraphIcon size={22} />} label="복잡한 그림" />
            <Tile icon={<ChartLineIcon size={22} />} label="그래프" />
          </span>
        ),
      },
    ],
  },
  {
    year: '2026',
    tone: 'build',
    items: [
      {
        when: '2026년 4월',
        dateTime: '2026-04',
        title: '그림 설명 모델 고르기',
        description:
          '정답을 먼저 만들어 두고, Gemma와 Qwen 같은 오픈소스 시각 언어 모델(VLM)을 같은 그림으로 비교해 Qwen을 골랐어요.',
        visual: (
          <>
            <span className="process-logo">
              <img src={gemmaIcon} alt="" className="process-logo-icon" />
              <span className="process-tile-label">Gemma</span>
            </span>
            <span className="process-vs">vs</span>
            <span className="process-logo is-picked">
              <img src={qwenLogo} alt="" className="process-logo-wide" />
              <span className="process-tile-label">
                <CheckCircleIcon size={16} weight="fill" /> 채택
              </span>
            </span>
          </>
        ),
      },
      {
        when: '2026년 5~6월',
        dateTime: '2026-05',
        title: '그림 설명 모델 추가 학습',
        description: '고른 Qwen 모델을 공개 데이터의 그림·표 자료로 더 학습시키고, 평가용 자료는 학습에서 빼 두었어요.',
        visual: (
          <>
            <Tile icon={<DatabaseIcon size={34} />} label="공개 데이터" />
            <Arrow />
            <span className="process-logo">
              <img src={qwenLogo} alt="" className="process-logo-wide" />
              <span className="process-tile-label">추가 학습</span>
            </span>
          </>
        ),
      },
      {
        when: '2026년 7월',
        dateTime: '2026-07',
        title: '설명문 모음에서 점역 원고로',
        description: '그림 설명만 모은 결과가 아니라, 페이지 표시까지 갖춘 점역 원고 형식으로 바꿨어요.',
        visual: (
          <>
            <Tile icon={<ChatTextIcon size={34} />} label="설명문" />
            <Arrow />
            <Tile icon={<FileTextIcon size={34} />} label="점역 원고" />
          </>
        ),
      },
      {
        when: '2026년 8월',
        dateTime: '2026-08',
        title: '스캔한 페이지 글자 인식',
        description: '글이 그림으로만 들어 있는 페이지는 통째로 읽어 옮기고, 표는 칸을 따로 한 번 더 읽게 했어요.',
        visual: (
          <>
            <Tile icon={<ScanIcon size={34} />} label="스캔 페이지" />
            <Arrow />
            <Tile icon={<TextTIcon size={34} />} label="글자" />
          </>
        ),
      },
      {
        when: '2026년 10월',
        dateTime: '2026-10',
        title: '점역 규칙 반영과 배포 준비',
        description: '팀에서 정한 점역 규칙(제목 8칸, 본문 2칸 들여쓰기 등)에 결과를 맞추고 웹 배포를 준비했어요.',
        visual: (
          <>
            <span className="process-indent">
              <span>{'        제목'}</span>
              <span>{'  본문'}</span>
            </span>
            <Arrow />
            <Tile icon={<CloudArrowUpIcon size={34} />} label="웹 배포" />
          </>
        ),
      },
    ],
  },
]

// 현장 인터뷰(한국점자도서관·한국시각장애인복지관·하상장애인복지관)에서 확인한 것. 왼쪽 그림, 오른쪽 짧은 글
const FIELD_FINDINGS: Array<{ title: string; text: string; visual: ReactNode }> = [
  {
    title: '현장 세 곳 인터뷰',
    text: '한국점자도서관, 한국시각장애인복지관, 하상장애인복지관을 찾아갔어요.',
    visual: (
      <>
        <Tile icon={<BooksIcon size={28} />} label="점자도서관" />
        <Tile icon={<BuildingsIcon size={28} />} label="복지관" />
        <Tile icon={<BuildingsIcon size={28} />} label="복지관" />
      </>
    ),
  },
  {
    title: '가장 큰 병목은 시각자료 처리',
    text: '스캔(OCR)부터 텍스트 정리, 1차 교열까지가 가장 오래 걸려요.',
    visual: (
      <>
        <Tile icon={<ScanIcon size={26} />} label="스캔" />
        <Arrow />
        <Tile icon={<TextAlignLeftIcon size={26} />} label="정리" />
        <Arrow />
        <Tile icon={<PencilSimpleLineIcon size={26} />} label="교열" />
      </>
    ),
  },
  {
    title: '설명 쓰기가 어려워요',
    text: '그림·표는 뜻을 풀어 써야 하고, 문제집은 정답을 짐작하지 못하게 써야 해요.',
    visual: (
      <>
        <Tile icon={<ImageIcon size={28} />} label="그림·표" />
        <Arrow />
        <Tile icon={<QuestionIcon size={28} />} label="어떻게 설명?" />
      </>
    ),
  },
  {
    title: '형식은 손으로 맞춰요',
    text: '페이지 번호, 표 시작·끝 표시, 장식 요소 지우기를 하나하나 해요.',
    visual: (
      <span className="process-indent">
        <span>@@p3</span>
        <span>[표 시작]</span>
        <span>[표 끝]</span>
      </span>
    ),
  },
]

// 피치덱 '04 PRODUCT PRINCIPLE': 반복 작업은 AI가, 판단은 전문 인력이, 그 결과 학습자는 더 빨리 자료를 받는다
const PRINCIPLE: Array<{ title: string; sub: string; points: string }> = [
  {
    title: 'AI 초안',
    sub: '반복 작업은 AI가',
    points: '시각자료 설명문 초안, 문서 구조·형식 정리, 기관 형식에 맞춘 DOCX 변환',
  },
  {
    title: '사람 검수',
    sub: '판단은 전문 인력이',
    points: '점역가·실무자의 최종 검수, 정답 유추 방지와 표현 강도 조절, 학습자 수준에 맞춘 설명',
  },
  {
    title: '학습자 접근',
    sub: '더 빠른 자료 제공',
    points: '수업과 복습 시차 감소, 학습권과 교육 접근성 향상',
  },
]

function StorySection() {
  return (
    <section className="welcome-section" aria-labelledby="welcome-story-title">
      <div className="welcome-section-head">
        <h2 id="welcome-story-title" className="welcome-section-title">
          BridgeOn이 시작된 이야기
        </h2>
        <p className="welcome-section-description">
          2025년 2학기, 충북대학교 장애학생지원센터의 의뢰에서 시작된 프로젝트예요.
        </p>
      </div>

      <div className="welcome-story-grid">
        <div className="welcome-story-card">
          <h3 className="welcome-story-card-title">현장에서 확인한 문제</h3>
          <ul className="welcome-field-list" role="list">
            {FIELD_FINDINGS.map((item) => (
              <li key={item.title} className="welcome-process-item">
                <div className="welcome-process-visual" aria-hidden="true">
                  {item.visual}
                </div>
                <div className="welcome-process-text">
                  <span className="welcome-timeline-title">{item.title}</span>
                  <span className="welcome-timeline-description">{item.text}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="welcome-story-card is-accent">
          <h3 className="welcome-story-card-title">AI는 최종 판단자가 아니라 초안 작성자예요</h3>
          <p className="welcome-story-text">
            완전 자동화가 아니에요. 사람이 판단하기 전에 반복해야 하는 초안 작성과 형식 정리 시간을 줄여요.
          </p>
          <ol className="welcome-principle" role="list">
            {PRINCIPLE.map((step, index) => (
              <li key={step.title} className="welcome-principle-step">
                <span className="welcome-principle-number" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="welcome-principle-text">
                  <span className="welcome-principle-title">
                    {step.title} <span className="welcome-principle-sub">{step.sub}</span>
                  </span>
                  <span className="welcome-principle-points">{step.points}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="welcome-process">
        <h3 className="welcome-story-card-title">만들어 온 과정</h3>
        {YEARS.map(({ year, tone, items }) => (
          <div key={year} className={`welcome-process-year is-${tone}`}>
            <h4 className="welcome-process-year-label">{year}</h4>
            <ol className="welcome-process-list" role="list">
              {items.map((item) => (
                <li key={item.title} className="welcome-process-item">
                  <div className="welcome-process-visual" aria-hidden="true">
                    {item.visual}
                  </div>
                  <div className="welcome-process-text">
                    {item.dateTime ? (
                      <time className="welcome-timeline-when" dateTime={item.dateTime}>
                        {item.when}
                      </time>
                    ) : (
                      <span className="welcome-timeline-when">{item.when}</span>
                    )}
                    <span className="welcome-timeline-title">{item.title}</span>
                    <span className="welcome-timeline-description">{item.description}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}

        <p className="welcome-credit">
          로고: Qwen(Alibaba Cloud), Gemma(Google DeepMind). 둘 다 Apache License 2.0으로 위키미디어 공용에 올라온 것을 썼고, 각
          회사의 상표예요. 어떤 모델을 썼는지 알리는 용도로만 넣었어요.
        </p>
      </div>
    </section>
  )
}

export default StorySection
