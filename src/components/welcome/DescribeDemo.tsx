import { useState, type ReactNode } from 'react'
import TxtView from './TxtView'

// 원본 그림은 화면에서 보여 주기만 하고, 스크린리더에는 옆의 변환 결과를 읽게 한다.

function ChartDrawing() {
  const bars: Array<[string, number]> = [
    ['1학년', 12],
    ['2학년', 18],
    ['3학년', 25],
    ['4학년', 9],
  ]
  return (
    <svg viewBox="0 0 320 210" className="demo-drawing">
      <text x="160" y="20" textAnchor="middle" className="svg-title">
        학년별 한 달 평균 도서관 이용
      </text>
      <line x1="40" y1="180" x2="300" y2="180" className="svg-axis" />
      <line x1="40" y1="40" x2="40" y2="180" className="svg-axis" />
      {[0, 10, 20, 30].map((value) => (
        <text key={value} x="32" y={184 - value * 4.5} textAnchor="end" className="svg-small">
          {value}
        </text>
      ))}
      {bars.map(([label, value], index) => {
        const x = 62 + index * 60
        const height = value * 4.5
        return (
          <g key={label}>
            <rect x={x} y={180 - height} width="36" height={height} rx="3" className="svg-bar" />
            <text x={x + 18} y={174 - height} textAnchor="middle" className="svg-small">
              {value}회
            </text>
            <text x={x + 18} y="198" textAnchor="middle" className="svg-small">
              {label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function TableDrawing() {
  const rows = [
    ['유동자산', '1,200', '1,450'],
    ['비유동자산', '3,800', '3,600'],
    ['부채', '2,100', '1,900'],
    ['자본', '2,900', '3,150'],
  ]
  return (
    <div className="demo-slide">
      <p className="demo-slide-title">재무상태표</p>
      <table className="demo-table">
        <thead>
          <tr>
            <th>항목</th>
            <th>2025년</th>
            <th>2026년</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, before, after]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{before}</td>
              <td>{after}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="demo-slide-note">단위: 만 원</p>
    </div>
  )
}

function FlowDrawing() {
  const boxes: Array<[string, number, number]> = [
    ['생성', 6, 30],
    ['준비', 92, 30],
    ['실행', 178, 30],
    ['종료', 264, 30],
    ['대기', 178, 140],
  ]
  return (
    <svg viewBox="0 0 330 200" className="demo-drawing">
      <defs>
        <marker id="demo-flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="svg-arrow-head" />
        </marker>
      </defs>
      {boxes.map(([label, x, y]) => (
        <g key={label}>
          <rect x={x} y={y} width="56" height="36" rx="8" className="svg-box" />
          <text x={x + 28} y={y + 23} textAnchor="middle" className="svg-label">
            {label}
          </text>
        </g>
      ))}
      <line x1="62" y1="48" x2="90" y2="48" className="svg-arrow" markerEnd="url(#demo-flow-arrow)" />
      <line x1="148" y1="41" x2="176" y2="41" className="svg-arrow" markerEnd="url(#demo-flow-arrow)" />
      <line x1="178" y1="56" x2="150" y2="56" className="svg-arrow" markerEnd="url(#demo-flow-arrow)" />
      <line x1="234" y1="48" x2="262" y2="48" className="svg-arrow" markerEnd="url(#demo-flow-arrow)" />
      <line x1="206" y1="66" x2="206" y2="137" className="svg-arrow" markerEnd="url(#demo-flow-arrow)" />
      <line x1="178" y1="150" x2="110" y2="69" className="svg-arrow" markerEnd="url(#demo-flow-arrow)" />
      <text x="163" y="84" textAnchor="middle" className="svg-small">
        시간 만료
      </text>
      <text x="214" y="106" className="svg-small">
        입출력 요청
      </text>
      <text x="40" y="126" className="svg-small">
        입출력 끝
      </text>
    </svg>
  )
}

function CellDrawing() {
  const chloroplasts: Array<[number, number]> = [
    [72, 150],
    [120, 54],
    [196, 156],
    [70, 60],
  ]
  return (
    <svg viewBox="0 0 320 214" className="demo-drawing">
      <rect x="40" y="26" width="180" height="152" rx="18" className="svg-cell-wall" />
      <rect x="49" y="35" width="162" height="134" rx="13" className="svg-cell-membrane" />
      <ellipse cx="162" cy="104" rx="38" ry="46" className="svg-vacuole" />
      <circle cx="96" cy="104" r="22" className="svg-nucleus" />
      <circle cx="100" cy="100" r="6" className="svg-nucleolus" />
      {chloroplasts.map(([cx, cy]) => (
        <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx="11" ry="6" className="svg-chloroplast" />
      ))}
      <line x1="222" y1="40" x2="246" y2="40" className="svg-leader" />
      <text x="250" y="44" className="svg-small">세포벽</text>
      <line x1="211" y1="76" x2="246" y2="76" className="svg-leader" />
      <text x="250" y="80" className="svg-small">세포막</text>
      <line x1="196" y1="110" x2="246" y2="112" className="svg-leader" />
      <text x="250" y="116" className="svg-small">액포</text>
      <line x1="207" y1="156" x2="246" y2="150" className="svg-leader" />
      <text x="250" y="154" className="svg-small">엽록체</text>
      <line x1="96" y1="126" x2="96" y2="194" className="svg-leader" />
      <text x="96" y="208" textAnchor="middle" className="svg-small">핵</text>
    </svg>
  )
}

function PhotoDrawing() {
  const chimneys = [70, 104, 178, 236]
  return (
    <svg viewBox="0 0 320 210" className="demo-drawing demo-photo">
      <rect x="0" y="0" width="320" height="210" className="svg-photo-sky" />
      {chimneys.map((x, index) => (
        <g key={x}>
          <circle cx={x + 10} cy={52 - index * 4} r="14" className="svg-photo-smoke" />
          <circle cx={x + 24} cy={36 - index * 4} r="18" className="svg-photo-smoke" />
          <circle cx={x + 42} cy={24 - index * 4} r="12" className="svg-photo-smoke" />
          <rect x={x} y={64 - index * 4} width="10" height={90 + index * 4} className="svg-photo-dark" />
        </g>
      ))}
      <rect x="20" y="112" width="120" height="50" className="svg-photo-dark" />
      <rect x="150" y="100" width="140" height="62" className="svg-photo-mid" />
      <rect x="0" y="160" width="320" height="16" className="svg-photo-ground" />
      <rect x="0" y="176" width="320" height="34" className="svg-photo-caption" />
      <text x="160" y="192" textAnchor="middle" className="svg-photo-text">
        THE INDUSTRIAL REVOLUTION
      </text>
      <text x="160" y="205" textAnchor="middle" className="svg-photo-text">
        1750-1840
      </text>
    </svg>
  )
}

function SlideDrawing() {
  return (
    <div className="demo-slide">
      <p className="demo-slide-title">사회학적 이론</p>
      <p className="demo-slide-text">
        이론은 <strong>당대의 주요한 사회·정치적 문제</strong>와 밀접하게 결부
      </p>
      <ul className="demo-slide-list">
        <li>마르크스: 자본주의 경제와 불평등의 원인</li>
        <li>뒤르켐: 산업사회의 특성과 세속화</li>
        <li>베버: 자본주의 발생과 관료제</li>
      </ul>
    </div>
  )
}

type Example = {
  id: string
  label: string
  source: string
  drawing: ReactNode
  lines: string[]
}

// 예시 결과는 실제 TXT 규칙(제목 8칸·본문 2칸 들여쓰기, @@p 페이지 표시, 구간 표시, _강조_)을 따른다.
const EXAMPLES: Example[] = [
  {
    id: 'chart',
    label: '막대그래프',
    source: '통계학 강의 5페이지',
    drawing: <ChartDrawing />,
    lines: [
      '@@p5',
      '        학년별 도서관 이용',
      '[그림 시작]',
      '  학년별 한 달 평균 도서관 이용 횟수를 나타낸 세로 막대그래프',
      '  가로축은 학년, 세로축은 이용 횟수(회)이다.',
      '  1학년 12회, 2학년 18회, 3학년 25회, 4학년 9회로 3학년이 가장 많고 4학년이 가장 적다.',
      '[그림 끝]',
    ],
  },
  {
    id: 'table',
    label: '표',
    source: '회계원리 12페이지',
    drawing: <TableDrawing />,
    lines: [
      '@@p12',
      '        재무상태표',
      '[표 시작]',
      '항목 / 2025년 / 2026년',
      '유동자산 / 1,200 / 1,450',
      '비유동자산 / 3,800 / 3,600',
      '부채 / 2,100 / 1,900',
      '자본 / 2,900 / 3,150',
      '[표 끝]',
      '  단위: 만 원',
    ],
  },
  {
    id: 'flow',
    label: '흐름도',
    source: '운영체제 8페이지',
    drawing: <FlowDrawing />,
    lines: [
      '@@p8',
      '        프로세스 상태 전이',
      '[그림 시작]',
      '  프로세스의 다섯 가지 상태와 옮겨 가는 방향을 화살표로 나타낸 흐름도',
      '  생성, 준비, 실행, 종료 순서로 이어진다.',
      '  실행 중 할당 시간이 끝나면 준비로 돌아간다.',
      '  실행 중 입출력을 요청하면 대기로 가고, 입출력이 끝나면 준비로 돌아간다.',
      '[그림 끝]',
    ],
  },
  {
    id: 'diagram',
    label: '구조 그림',
    source: '세포생물학 슬라이드 3',
    drawing: <CellDrawing />,
    lines: [
      '@@p3',
      '        식물 세포의 구조',
      '[그림 시작]',
      '  식물 세포 하나를 단면으로 그리고 각 부분에 이름표를 단 그림',
      '  가장 바깥을 두꺼운 세포벽이 둘러싸고, 바로 안쪽에 얇은 세포막이 있다.',
      '  왼쪽에 둥근 핵, 가운데에 큰 액포가 있다.',
      '  초록색 타원 모양의 엽록체 4개가 세포 가장자리를 따라 흩어져 있다.',
      '[그림 끝]',
    ],
  },
  {
    id: 'photo',
    label: '사진',
    source: '사회학원론 7페이지',
    drawing: <PhotoDrawing />,
    lines: [
      '@@p7',
      '        사회변동과 사회학의 성립',
      '[그림 시작]',
      '  굴뚝 여러 개에서 연기가 피어오르는 공장 지대를 멀리서 찍은 흑백 사진',
      "  사진 아래에 'THE INDUSTRIAL REVOLUTION'과 '1750-1840'이라는 글자가 있다.",
      '[그림 끝]',
    ],
  },
  {
    id: 'slide',
    label: '제목·목록·강조',
    source: '사회학원론 6페이지',
    drawing: <SlideDrawing />,
    lines: [
      '@@p6',
      '        사회학적 이론',
      '  이론은 _당대의 주요한 사회·정치적 문제_와 밀접하게 결부',
      '  ✓ 마르크스: 자본주의 경제와 불평등의 원인',
      '  ✓ 뒤르켐: 산업사회의 특성과 세속화',
      '  ✓ 베버: 자본주의 발생과 관료제',
    ],
  },
]

function DescribeDemo() {
  const [selectedId, setSelectedId] = useState(EXAMPLES[0].id)
  const example = EXAMPLES.find((item) => item.id === selectedId) ?? EXAMPLES[0]

  return (
    <div className="demo-describe">
      <div className="demo-chip-row" role="group" aria-label="예시 고르기">
        {EXAMPLES.map((item) => (
          <button
            key={item.id}
            type="button"
            className="demo-chip"
            aria-pressed={item.id === selectedId}
            onClick={() => setSelectedId(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="demo-compare">
        <div className="demo-compare-col">
          <p className="demo-col-label">원본 · {example.source}</p>
          <div className="demo-original" role="img" aria-label={`원본 ${example.label}. 내용은 옆의 변환 결과에서 읽을 수 있어요.`}>
            {example.drawing}
          </div>
        </div>
        <div className="demo-compare-col">
          <p className="demo-col-label">변환 결과 (TXT)</p>
          <TxtView lines={example.lines} />
        </div>
      </div>
    </div>
  )
}

export default DescribeDemo
