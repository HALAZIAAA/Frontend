import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import {
  ArrowRightIcon,
  CaretDownIcon,
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
  ScanIcon,
  TableIcon,
  TextTIcon,
} from '@phosphor-icons/react'
import { useInViewOnce } from '../../lib/useInViewOnce'

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

// 예시 안의 요소가 언제 움직일지 적는다. 예시 칸이 화면에 들어온 때부터 잰 밀리초다(welcome.css의 --t).
// then은 한 요소가 나중에 한 번 더 움직일 때의 시각이다(--t2).
const at = (ms: number, then?: number) =>
  ({ '--t': `${ms}ms`, ...(then === undefined ? {} : { '--t2': `${then}ms` }) }) as CSSProperties

// 스캔 예시에 그리는 막대그래프. 맨 위 움직이는 그림(HeroMotion)과 같은 값이다.
const SCAN_BARS: Array<[string, number]> = [
  ['1학년', 12],
  ['2학년', 18],
  ['3학년', 25],
  ['4학년', 9],
]

// 날짜 근거: 2025년은 2학기 중간 발표 자료·대본(11/4 발표), 2026년은 개발과정 정리 문서(01_문서/2026-08-11_개발과정_전체정리.md)
// 깃허브 개발 시작일은 저장소를 새로 만들면서 2026년으로 남아 있어서 넣지 않는다.
const YEARS: Array<{ year: string; tone: 'early' | 'build'; items: Milestone[] }> = [
  {
    year: '2025',
    tone: 'early',
    items: [
      {
        when: '2025년 2학기',
        title: '장애학생지원센터 의뢰로 프로젝트 시작',
        description: 'BridgeOn은 충북대학교 장애학생지원센터 의뢰로 시작했어요.',
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
          '강의자료 5가지(글·사진·표·복잡한 그림·그래프)를 변환해 발표했어요. 복잡한 그림 설명과 한 페이지에 1~10분 걸리는 속도가 다음 과제로 남았어요.',
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
      // 아래 두 항목(모델 고르기, 추가 학습)은 2026-11-21에 잠시 뺐다가 사용자 요청으로 같은 날 다시 넣었다.
      // 근거: 개발과정 정리 문서의 3단계 모델 선정 실험(2026-04-26)과 4단계 LoRA 파인튜닝(2026-05-02~06-04).
      {
        when: '2026년 4월',
        dateTime: '2026-04',
        title: '그림 설명 모델 고르기',
        description:
          '추가 학습에 쓸 모델을 골랐어요. 같은 그림을 여러 모델에게 설명하게 하고, 미리 작성한 정답과 비교했어요.',
        visual: (
          <>
            <Tile icon={<ChatTextIcon size={34} />} label="설명 비교" />
            <Arrow />
            <Tile icon={<CheckCircleIcon size={34} />} label="모델 선정" />
          </>
        ),
      },
      {
        when: '2026년 5~6월',
        dateTime: '2026-05',
        title: '그림 설명 모델 추가 학습',
        description: '공개 데이터에서 그림과 표를 골라 추가 학습에 썼어요. 평가용 자료는 따로 보관했어요.',
        visual: (
          <>
            <Tile icon={<DatabaseIcon size={34} />} label="공개 데이터" />
            <Arrow />
            <Tile icon={<GraduationCapIcon size={34} />} label="추가 학습" />
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
        description: '글이 그림으로만 들어 있는 페이지는 통째로 읽어 옮기게 했어요. 표는 칸을 따로 한 번 더 읽게 했어요.',
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
        description: '팀이 정한 점역 규칙(제목 8칸, 본문 2칸 들여쓰기 등)에 결과를 맞췄어요. 웹 배포도 준비했어요.',
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

// 현장 인터뷰(한국점자도서관·한국시각장애인복지관·하상장애인복지관)에서 확인한 문제 세 가지. 카드마다 짧은 글과 그 아래 작은 예시.
// 예시는 실제 자료가 아니라 이해를 돕기 위해 만든 것이다. 맨 위 움직이는 그림과 같은 '학년별 도서관 이용' 자료를 쓴다.
// 첫 카드의 깨진 글자도 실제 OCR 결과가 아니라 만든 것이다. 그림이 있는 쪽을 일반 OCR로 읽으면 글자가 깨진다는 것은
// 현장에서 확인한 내용이라고 사용자가 알려 줬다(2026-11-21).
// alt는 예시를 볼 수 없는 사용자에게 읽어 줄 설명이다. 줄마다 붙은 at()은 움직이는 순서다.
// turn은 카드 셋이 나란히 놓이는 넓은 화면에서 이 카드의 예시가 움직이기 시작하는 시각(밀리초)이다.
// 셋이 한꺼번에 움직이면 정신없다는 사용자 의견(2026-11-21)에 따라, 왼쪽 카드의 움직임이 다 끝난 뒤에 다음 카드가 시작한다.
// 한 카드의 움직임은 3초쯤 걸린다. at() 값을 바꿔 길이가 달라지면 turn도 같이 고친다.
const FIELD_FINDINGS: Array<{ title: string; text: string; alt: string; turn: number; visual: ReactNode }> = [
  {
    title: '시각자료 처리가 가장 큰 병목',
    turn: 0,
    text: '스캔(OCR)부터 텍스트 정리, 1차 교열까지가 가장 오래 걸려요. 그림이 있는 쪽은 일반 OCR로 읽으면 글자가 깨져요.',
    alt: '예시: 제목 ‘학년별 도서관 이용’ 아래에 막대그래프가 있는 쪽을 스캔했다. 일반 OCR로 읽으면 제목은 그대로 읽히지만, 그래프에 적힌 글자는 ‘ㅣ2회 ■ l8회 2S회 9회’, ‘l학넌 2학넌 3확년 4학넌’처럼 깨진다. 사람이 교열하면서 ‘12회 18회 25회 9회’, ‘1학년 2학년 3학년 4학년’으로 하나씩 고친다.',
    visual: (
      <span className="field-steps">
        <span className="field-step" style={at(100)}>
          <span className="field-step-label">스캔</span>
          <span className="field-page">
            <span className="field-page-title">학년별 도서관 이용</span>
            <svg viewBox="0 0 200 76" className="field-page-chart">
              <line x1="8" y1="57" x2="192" y2="57" />
              {SCAN_BARS.map(([label, value], index) => {
                const x = 31 + index * 46
                const height = value * 1.5
                return (
                  <g key={label}>
                    <rect x={x - 11} y={57 - height} width="22" height={height} />
                    <text x={x} y={53 - height} textAnchor="middle">
                      {value}회
                    </text>
                    <text x={x} y="71" textAnchor="middle">
                      {label}
                    </text>
                  </g>
                )
              })}
            </svg>
            <span className="field-beam" />
          </span>
        </span>
        <span className="field-step" style={at(950)}>
          <span className="field-step-label">일반 OCR</span>
          <span className="field-line field-ocr">
            <span className="field-ln" style={at(1000)}>
              학년별 도서관 이용
            </span>
            <span className="field-ln" style={at(1150)}>
              <mark>ㅣ</mark>2회 <mark>■</mark> <mark>l</mark>8회 2<mark>S</mark>회 9회
            </span>
            <span className="field-ln" style={at(1300)}>
              <mark>l</mark>학<mark>넌</mark> 2학<mark>넌</mark> 3<mark>확</mark>년 4학<mark>넌</mark>
            </span>
          </span>
        </span>
        <span className="field-step" style={at(2000)}>
          <span className="field-step-label">교열</span>
          <span className="field-line">
            <span className="field-ln" style={at(2050)}>
              <strong>1</strong>2회 <strong>1</strong>8회 2<strong>5</strong>회 9회
            </span>
            <span className="field-ln" style={at(2250)}>
              <strong>1</strong>학<strong>년</strong> 2학<strong>년</strong> 3<strong>학</strong>년 4학<strong>년</strong>
            </span>
          </span>
        </span>
      </span>
    ),
  },
  {
    title: '설명 쓰기가 어려워요',
    turn: 3100,
    text: '그림·표는 뜻을 풀어 써야 해요. 문제집은 정답을 짐작하지 못하게 써야 해요.',
    alt: '예시: 한 각이 35도이고 다른 한 각이 x인 직각삼각형 문제 그림. ‘x가 55도인 직각삼각형’이라고 쓰면 정답이 드러나므로, ‘한 각은 35도, 다른 한 각은 x인 직각삼각형’처럼 보이는 것만 쓴다.',
    visual: (
      <span className="field-describe">
        <svg viewBox="0 0 120 80" className="field-figure" style={at(100)}>
          <polygon points="20,70 100,70 100,14" pathLength={1} className="field-figure-shape" />
          <rect x="91" y="61" width="9" height="9" className="field-figure-mark" />
          <path d="M36,70 A16,16 0 0 0 33.1,60.8" pathLength={1} className="field-figure-arc" style={at(750)} />
          <text x="40" y="66" className="svg-small field-figure-label" style={at(850)}>
            35°
          </text>
          <path d="M100,26 A12,12 0 0 1 90.2,20.9" pathLength={1} className="field-figure-arc" style={at(1050)} />
          <text x="95" y="36" textAnchor="end" className="svg-small field-figure-label field-figure-x" style={at(1150, 1800)}>
            x
          </text>
        </svg>
        <span className="field-step" style={at(1450)}>
          <span className="field-step-label is-bad">정답이 드러남</span>
          <span className="field-line">
            x가 <mark>55도</mark>인 직각삼각형
          </span>
        </span>
        <span className="field-step" style={at(2250)}>
          <span className="field-step-label">보이는 것만</span>
          <span className="field-line">
            한 각은 35도, 다른 한 각은 <strong>x</strong>인 직각삼각형
          </span>
        </span>
      </span>
    ),
  },
  {
    title: '형식은 손으로 맞춰요',
    turn: 6200,
    text: '페이지 번호, 표 시작·끝 표시, 장식 요소 지우기를 하나하나 해요.',
    alt: '예시: 뽑아낸 글 ‘5, 학년별 도서관 이용, 1학년 12회, 2학년 18회’를 손으로 점역 형식에 맞춘다. 쪽 표시 @@p5를 넣고, 제목을 여덟 칸 들여 쓰고, 표 앞뒤에 [표 시작]과 [표 끝]을 넣는다.',
    visual: (
      <span className="field-format">
        <span className="field-step" style={at(100)}>
          <span className="field-step-label">뽑은 글</span>
          <span className="field-txt">
            <span className="field-ln" style={at(200)}>
              5
            </span>
            <span className="field-ln" style={at(300)}>
              학년별 도서관 이용
            </span>
            <span className="field-ln" style={at(400)}>
              1학년 12회
            </span>
            <span className="field-ln" style={at(500)}>
              2학년 18회
            </span>
          </span>
        </span>
        <span className="field-step" style={at(900)}>
          <span className="field-step-label">맞춘 형식</span>
          <span className="field-txt">
            <span className="field-ln" style={at(1000)}>
              <span className="field-added">@@p</span>5
            </span>
            <span className="field-ln" style={at(1200)}>
              <span className="field-indent">········</span>
              <span className="field-pushed">학년별 도서관 이용</span>
            </span>
            <span className="field-ln" style={at(1500)}>
              <span className="field-added">[표 시작]</span>
            </span>
            <span className="field-ln" style={at(1700)}>
              1학년 12회
            </span>
            <span className="field-ln" style={at(1850)}>
              2학년 18회
            </span>
            <span className="field-ln" style={at(2050)}>
              <span className="field-added">[표 끝]</span>
            </span>
          </span>
        </span>
      </span>
    ),
  },
]

// 예시 칸: 절반 넘게 화면에 들어왔을 때 한 번 움직인다(lib/useInViewOnce.ts).
// 움직임은 welcome.css의 field-* 규칙이 맡고, '동작 줄이기'를 켠 사용자에게는 다 그려진 모습만 보인다.
function ProblemExample({ alt, turn, children }: { alt: string; turn: number; children: ReactNode }) {
  const [ref, playing] = useInViewOnce<HTMLDivElement>(0.5)

  return (
    <div
      ref={ref}
      className={`welcome-problem-example ${playing ? 'is-playing' : ''}`}
      style={{ '--turn': `${turn}ms` } as CSSProperties}
      role="img"
      aria-label={alt}
    >
      {children}
    </div>
  )
}

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
    points: '점역가·실무자의 최종 검수, 정답 짐작 방지와 표현 강도 조절, 학습자 수준에 맞춘 설명',
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
          충북대학교 장애학생지원센터 의뢰로 2025년 2학기에 시작한 프로젝트예요.
        </p>
      </div>

      <h3 className="welcome-story-card-title">현장에서 확인한 문제</h3>
      <p className="welcome-story-text welcome-problems-lead">
        한국점자도서관, 한국시각장애인복지관, 하상장애인복지관을 찾아가 들었어요.
      </p>
      <ul className="welcome-problems" role="list">
        {FIELD_FINDINGS.map((item) => (
          <li key={item.title} className="welcome-story-card welcome-problem">
            <span className="welcome-timeline-title">{item.title}</span>
            <span className="welcome-timeline-description">{item.text}</span>
            <ProblemExample alt={item.alt} turn={item.turn}>
              {item.visual}
            </ProblemExample>
          </li>
        ))}
      </ul>
      <p className="welcome-field-note">초록 칸은 이해를 돕기 위해 만든 예시예요.</p>

      <div className="welcome-story-card is-accent welcome-principle-card">
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
    </section>
  )
}

// 만들어 온 과정: 해마다 묶은 연표. 문제·기능·결과를 먼저 보여 주고 아래쪽에 따로 둔다.
// 길어서 한 줄에 날짜와 제목만 보여 주고, 줄을 누르면 그림과 설명이 펼쳐진다.
export function ProcessSection() {
  const listRef = useRef<HTMLDivElement>(null)
  const [allOpen, setAllOpen] = useState(false)

  // 줄마다 따로 여닫을 수 있어서, '모두 펼치기'는 화면에 있는 줄을 직접 한꺼번에 여닫는다.
  const toggleAll = () => {
    const next = !allOpen
    listRef.current?.querySelectorAll('details').forEach((row) => {
      row.open = next
    })
    setAllOpen(next)
  }

  return (
    <section className="welcome-section" aria-labelledby="welcome-process-title">
      <div className="welcome-section-head welcome-process-head">
        <div>
          <h2 id="welcome-process-title" className="welcome-section-title">
            만들어 온 과정
          </h2>
          <p className="welcome-section-description">
            2025년 2학기 의뢰부터 2026년 웹 배포 준비까지예요. 줄을 누르면 자세한 내용이 펼쳐져요.
          </p>
        </div>
        <button type="button" className="demo-ghost-button" onClick={toggleAll}>
          {allOpen ? '모두 접기' : '모두 펼치기'}
        </button>
      </div>

      <div className="welcome-process" ref={listRef}>
        {YEARS.map(({ year, tone, items }) => (
          <div key={year} className={`welcome-process-year is-${tone}`}>
            <h3 className="welcome-process-year-label">{year}</h3>
            <ol className="welcome-process-list" role="list">
              {items.map((item) => (
                <li key={item.title}>
                  <details className="welcome-process-row">
                    <summary className="welcome-process-summary">
                      {item.dateTime ? (
                        <time className="welcome-timeline-when" dateTime={item.dateTime}>
                          {item.when}
                        </time>
                      ) : (
                        <span className="welcome-timeline-when">{item.when}</span>
                      )}
                      <span className="welcome-timeline-title">{item.title}</span>
                      <CaretDownIcon aria-hidden="true" size={18} className="welcome-process-caret" />
                    </summary>
                    <div className="welcome-process-item">
                      <div className="welcome-process-visual" aria-hidden="true">
                        {item.visual}
                      </div>
                      <div className="welcome-process-text">
                        <span className="welcome-timeline-description">{item.description}</span>
                      </div>
                    </div>
                  </details>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  )
}

export default StorySection
