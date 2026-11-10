import { useState } from 'react'
import { ArrowSquareOutIcon } from '@phosphor-icons/react'
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
                <TxtView lines={RESULT_PAGES[chapter.page - 1] ?? []} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default ExamplesPage
