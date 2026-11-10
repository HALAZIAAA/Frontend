import { useEffect, useRef, useState } from 'react'
import { ArrowSquareOutIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import Navbar from '../components/layout/Navbar'
import TxtView from '../components/welcome/TxtView'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { useTabs } from '../lib/useTabs'
import resultTxt from '../assets/examples/lecture-10.txt?raw'
import '../styles/navbar.css'
import '../styles/welcome.css'
import '../styles/examples.css'

// 원본 PDF(강의자료_10장_합본.pdf)를 쪽마다 그린 이미지. page-01.webp ~ page-10.webp 순서대로 쓴다.
const PAGE_IMAGES = Object.entries(
  import.meta.glob<string>('../assets/examples/page-*.webp', { eager: true, import: 'default' }),
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url)

// 변환 결과 TXT를 쪽 표시(@@p1) 기준으로 쪽마다 나눈다.
// 이 TXT는 bridgeonit Beta 1.1이 만든 초안을 원본과 대조해 보완한 것이다.
const RESULT_PAGES: string[][] = []
for (const line of resultTxt.replace(/\r\n/g, '\n').trimEnd().split('\n')) {
  if (/^\s*@@p\d+$/.test(line)) RESULT_PAGES.push([])
  RESULT_PAGES.at(-1)?.push(line)
}

// 쪽 제목: 결과 TXT에서 8칸 들여 쓴 첫 줄
function titleOf(pageNumber: number): string {
  const lines = RESULT_PAGES[pageNumber - 1] ?? []
  return lines.find((line) => line.startsWith('        '))?.trim() ?? `${pageNumber}쪽`
}

type SubjectId = 'electronics' | 'economics' | 'computer' | 'science' | 'history'

type Subject = {
  id: SubjectId
  label: string
  course: string
  // 주제마다 2장. page는 합본 PDF의 쪽 번호, contains는 그 장에 들어 있는 요소
  chapters: Array<{ page: number; contains: string }>
}

const SUBJECTS: Subject[] = [
  {
    id: 'electronics',
    label: '전자공학',
    course: '전자공학개론 3주차',
    chapters: [
      { page: 1, contains: '수식 2개, 회로도, 풀이' },
      { page: 2, contains: '논리 게이트 회로, 진리표' },
    ],
  },
  {
    id: 'economics',
    label: '경제학',
    course: '경제원론 4주차',
    chapters: [
      { page: 3, contains: '표, 곡선 이동 그래프' },
      { page: 4, contains: '수식, 구분 표, 상품별 막대그래프' },
    ],
  },
  {
    id: 'computer',
    label: '컴퓨터공학',
    course: '자료구조 9주차',
    chapters: [
      { page: 5, contains: '방향 그래프, 코드' },
      { page: 6, contains: '터미널 캡처, 2단계 글머리표' },
    ],
  },
  {
    id: 'science',
    label: '생명과학·화학',
    course: '일반생물학·일반화학',
    chapters: [
      { page: 7, contains: '16조각으로 쪼개진 삽화, 병합 셀 표' },
      { page: 8, contains: '화학 반응식, 분자 구조식, 주기율표 일부' },
    ],
  },
  {
    id: 'history',
    label: '한국사',
    course: '한국사 10주차',
    chapters: [
      { page: 9, contains: '연표, 한자 병기' },
      { page: 10, contains: '개항장 약도, 표, 한자 병기' },
    ],
  },
]

const SUBJECT_IDS = SUBJECTS.map((subject) => subject.id)

// 변환 결과를 원본 그림과 같은 크기의 칸에 넣고, 넘치는 글은 이전·다음 버튼으로 넘겨 본다.
// 글을 CSS 단(column)으로 옆으로 흘려 두고 한 단씩 보여 주므로 줄이 중간에 잘리지 않는다.
// 가려진 단도 문서에는 그대로 있어서 스크린리더는 넘기지 않아도 전체를 읽는다.
function PagedTxt({ lines }: { lines: string[] }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [part, setPart] = useState(0)
  const [partCount, setPartCount] = useState(1)

  useEffect(() => {
    const pre = boxRef.current?.querySelector('pre')
    if (!pre) return
    // 칸 크기나 글자 크기가 바뀌면 몇 부분으로 나뉘는지 다시 세고, 보던 곳과 가장 가까운 부분에 맞춘다.
    const measure = () => {
      const count = Math.max(1, Math.round(pre.scrollWidth / pre.clientWidth))
      const current = Math.min(count - 1, Math.round(pre.scrollLeft / pre.clientWidth))
      pre.scrollLeft = current * pre.clientWidth
      setPartCount(count)
      setPart(current)
    }
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(pre)
    const textSizeObserver = new MutationObserver(measure)
    textSizeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-text-size'] })
    void document.fonts.ready.then(measure)
    return () => {
      resizeObserver.disconnect()
      textSizeObserver.disconnect()
    }
  }, [])

  const show = (next: number) => {
    const pre = boxRef.current?.querySelector('pre')
    if (!pre) return
    pre.scrollLeft = next * pre.clientWidth
    setPart(next)
  }

  return (
    <>
      <div className="examples-result" ref={boxRef}>
        <TxtView lines={lines} />
      </div>
      {partCount > 1 && (
        <div className="examples-pager">
          <button
            type="button"
            className="demo-chip"
            aria-label="변환 결과 이전 부분"
            disabled={part === 0}
            onClick={() => show(part - 1)}
          >
            <CaretLeftIcon aria-hidden="true" size={16} weight="bold" />
            이전
          </button>
          <span className="examples-pager-count" aria-live="polite">
            {part + 1} / {partCount}
          </span>
          <button
            type="button"
            className="demo-chip"
            aria-label="변환 결과 다음 부분"
            disabled={part >= partCount - 1}
            onClick={() => show(part + 1)}
          >
            다음
            <CaretRightIcon aria-hidden="true" size={16} weight="bold" />
          </button>
        </div>
      )}
    </>
  )
}

// 예시 강의자료를 실제로 변환한 결과를 주제별로 원본과 나란히 보여 주는 화면.
function ExamplesPage() {
  useDocumentTitle('변환 예시')
  const [subjectId, setSubjectId] = useState<SubjectId>('electronics')
  const [chapterIndex, setChapterIndex] = useState(0)

  const selectSubject = (id: SubjectId) => {
    setSubjectId(id)
    setChapterIndex(0)
  }

  const { getTabProps, panelProps } = useTabs({
    idPrefix: 'examples-subject',
    tabs: SUBJECT_IDS,
    selected: subjectId,
    onSelect: selectSubject,
  })

  const subject = SUBJECTS.find((item) => item.id === subjectId) ?? SUBJECTS[0]
  const chapter = subject.chapters[chapterIndex] ?? subject.chapters[0]
  const title = titleOf(chapter.page)
  const image = PAGE_IMAGES[chapter.page - 1]

  return (
    <div className="welcome-wrapper">
      <Navbar />

      <main className="page-container examples-main">
        <section aria-labelledby="examples-title">
          {/* 화면에는 보이지 않는 제목. 스크린리더가 화면 이름을 알 수 있게 남겨 둔다. */}
          <h1 id="examples-title" className="examples-sr-only">
            주제별 변환 예시
          </h1>

          <div className="welcome-feature-tabs" role="tablist" aria-label="주제">
            {SUBJECTS.map(({ id, label }, index) => (
              <button key={id} type="button" className="welcome-feature-tab" {...getTabProps(id, index)}>
                {label}
              </button>
            ))}
          </div>

          <div className="examples-panel" {...panelProps}>
            <h2 className="demo-heading">
              {subject.label} <span className="demo-subtle">{subject.course}</span>
            </h2>

            <div className="demo-chip-row" role="group" aria-label={`${subject.label} 장 고르기`}>
              {subject.chapters.map((item, index) => (
                <button
                  key={item.page}
                  type="button"
                  className="demo-chip"
                  aria-pressed={index === chapterIndex}
                  onClick={() => setChapterIndex(index)}
                >
                  {index + 1}장 · {titleOf(item.page)}
                </button>
              ))}
            </div>
            <p className="examples-contains">이 장에 들어 있는 것: {chapter.contains}</p>

            <div className="demo-compare">
              <div className="demo-compare-col">
                <p className="demo-col-label">원본 · 합본 PDF {chapter.page}쪽</p>
                <img
                  className="examples-image"
                  src={image}
                  width={1440}
                  height={810}
                  alt={`원본 ${chapter.page}쪽 '${title}' 슬라이드. 내용은 옆의 변환 결과에서 읽을 수 있어요.`}
                />
                <a className="welcome-text-link" href={image} target="_blank" rel="noreferrer">
                  원본 크게 보기
                  <ArrowSquareOutIcon aria-hidden="true" size={18} />
                  <span className="examples-sr-only">(새 창)</span>
                </a>
              </div>
              <div className="demo-compare-col">
                <p className="demo-col-label">변환 결과 (TXT)</p>
                {/* 장을 바꾸면 새로 그려서 첫 부분부터 다시 보여 준다. */}
                <PagedTxt key={chapter.page} lines={RESULT_PAGES[chapter.page - 1] ?? []} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default ExamplesPage
