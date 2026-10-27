import { useState } from 'react'
import { EyeIcon, ImageIcon, TableIcon } from '@phosphor-icons/react'
import TxtView from './TxtView'

type DemoPage = {
  title: string
  figure: 'image' | 'table' | null
  lines: string[]
}

type DemoFile = {
  name: string
  unit: '페이지' | '슬라이드'
  status: '완료' | '변환 중'
  pages: DemoPage[]
}

// 목록에서 '미리보기'를 누르면 그 파일의 앞 페이지들을 원본과 결과로 나란히 보여 주는 흐름의 예시
const FILES: DemoFile[] = [
  {
    name: '사회학원론_3주차.pdf',
    unit: '페이지',
    status: '완료',
    pages: [
      {
        title: '현대사회와 사회학',
        figure: null,
        lines: ['@@p1', '        현대사회와 사회학', '      사회학과 전공기초', '      3주차'],
      },
      {
        title: '사회학적 이론',
        figure: null,
        lines: [
          '@@p2',
          '        사회학적 이론',
          '  이론은 _당대의 사회·정치적 문제_와 밀접하게 결부',
          '  ✓ 마르크스: 자본주의와 불평등',
          '  ✓ 뒤르켐: 산업사회와 세속화',
          '  ✓ 베버: 관료제와 합리화',
        ],
      },
      {
        title: '사회변동과 사회학',
        figure: 'image',
        lines: [
          '@@p3',
          '        사회변동과 사회학의 성립',
          '[그림 시작]',
          '  굴뚝에서 연기가 피어오르는 공장 지대를 찍은 흑백 사진',
          '[그림 끝]',
          '  산업혁명과 프랑스 혁명이 사회학이 생겨난 배경이다.',
        ],
      },
    ],
  },
  {
    name: '세포생물학_세포구조.pptx',
    unit: '슬라이드',
    status: '완료',
    pages: [
      {
        title: '세포의 구조',
        figure: null,
        lines: ['@@p1', '        세포의 구조', '  모든 생물은 세포로 이루어져 있다.'],
      },
      {
        title: '식물 세포',
        figure: 'image',
        lines: [
          '@@p2',
          '        식물 세포',
          '[그림 시작]',
          '  세포벽, 세포막, 핵, 액포, 엽록체에 이름표가 붙은 식물 세포 단면 그림',
          '[그림 끝]',
        ],
      },
      {
        title: '동물 세포와 비교',
        figure: 'table',
        lines: [
          '@@p3',
          '        동물 세포와 비교',
          '[표 시작]',
          '구조 / 식물 세포 / 동물 세포',
          '세포벽 / 있음 / 없음',
          '엽록체 / 있음 / 없음',
          '[표 끝]',
        ],
      },
    ],
  },
  { name: '회계원리_재무제표.pdf', unit: '페이지', status: '변환 중', pages: [] },
]

function PageThumb({ page, unit }: { page: DemoPage; unit: DemoFile['unit'] }) {
  return (
    <div className={`demo-thumb ${unit === '슬라이드' ? 'is-slide' : 'is-page'}`} aria-hidden="true">
      <span className="demo-thumb-title">{page.title}</span>
      <span className="demo-thumb-line" />
      <span className="demo-thumb-line is-short" />
      {page.figure && (
        <span className="demo-thumb-figure">
          {page.figure === 'image' ? <ImageIcon size={28} /> : <TableIcon size={28} />}
        </span>
      )}
      <span className="demo-thumb-line" />
    </div>
  )
}

function PreviewDemo() {
  const [fileIndex, setFileIndex] = useState(0)
  const [pageIndex, setPageIndex] = useState(0)
  const file = FILES[fileIndex]
  const page = file.pages[pageIndex] ?? file.pages[0]

  const openFile = (index: number) => {
    setFileIndex(index)
    setPageIndex(0)
  }

  return (
    <div className="demo-preview">
      <p className="demo-heading">변환된 파일 목록</p>
      <ul className="demo-file-list" role="list">
        {FILES.map((item, index) => (
          <li key={item.name} className={`demo-file-row ${index === fileIndex ? 'is-open' : ''}`}>
            <span className="demo-file-row-name">{item.name}</span>
            <span className={`demo-badge ${item.status === '완료' ? 'is-done' : 'is-processing'}`}>{item.status}</span>
            {item.status === '완료' && (
              <button
                type="button"
                className="demo-preview-button"
                aria-pressed={index === fileIndex}
                aria-label={`${item.name} 미리보기`}
                onClick={() => openFile(index)}
              >
                <EyeIcon aria-hidden="true" size={18} />
                미리보기
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="demo-preview-window">
        <p className="demo-heading">
          {file.name} <span className="demo-subtle">앞 {file.pages.length}{file.unit}</span>
        </p>
        <div className="demo-chip-row" role="group" aria-label={`미리볼 ${file.unit}`}>
          {file.pages.map((item, index) => (
            <button
              key={item.title}
              type="button"
              className="demo-chip"
              aria-pressed={index === pageIndex}
              onClick={() => setPageIndex(index)}
            >
              {file.unit === '페이지' ? `${index + 1}페이지` : `슬라이드 ${index + 1}`}
            </button>
          ))}
        </div>
        <div className="demo-compare">
          <div className="demo-compare-col">
            <p className="demo-col-label">원본</p>
            <PageThumb page={page} unit={file.unit} />
          </div>
          <div className="demo-compare-col">
            <p className="demo-col-label">변환 결과</p>
            <TxtView lines={page.lines} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreviewDemo
