import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { CaretLeftIcon, CaretRightIcon, MagnifyingGlassPlusIcon, XIcon } from '@phosphor-icons/react'
import { getFilePreview } from '../../api/fileApi'
import { useTabs } from '../../lib/useTabs'
import type { BackendPreviewParagraph, BackendPreviewResponse } from '../../types/fileConverter'
import { SkeletonList } from '../common/Skeleton'

type FilePreviewProps = {
  fileId: string
}

function paragraphClass(paragraph: BackendPreviewParagraph): string {
  if (paragraph.boundary) return 'file-preview-boundary'
  if (paragraph.heading_level) return 'file-preview-heading'
  if (paragraph.list_level !== null) return `file-preview-list level-${Math.min(paragraph.list_level, 3)}`
  return 'file-preview-paragraph'
}

// 변환 결과를 원본 그림과 같은 높이의 칸에 넣고, 넘치는 글은 이전·다음 버튼으로 넘겨 본다.
// 글을 CSS 단(column)으로 옆으로 흘려 두고 한 단씩 보여 주므로 줄이 중간에 잘리지 않는다.
// 가려진 단도 문서에는 그대로 있어서 스크린리더는 넘기지 않아도 전체를 읽는다.
// 좁은 화면이나 원본 그림이 없을 때는 단을 나누지 않으므로(CSS) 글 전체가 그대로 보이고 버튼도 없다.
function PagedResult({ children }: { children: ReactNode }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [part, setPart] = useState(0)
  const [partCount, setPartCount] = useState(1)

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    // 칸 크기나 글자 크기가 바뀌면 몇 부분으로 나뉘는지 다시 세고, 보던 곳과 가장 가까운 부분에 맞춘다.
    const measure = () => {
      if (box.clientWidth === 0) return
      const count = Math.max(1, Math.round(box.scrollWidth / box.clientWidth))
      const current = Math.min(count - 1, Math.round(box.scrollLeft / box.clientWidth))
      box.scrollLeft = current * box.clientWidth
      setPartCount(count)
      setPart(current)
    }
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(box)
    const textSizeObserver = new MutationObserver(measure)
    textSizeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-text-size'] })
    void document.fonts.ready.then(measure)
    return () => {
      resizeObserver.disconnect()
      textSizeObserver.disconnect()
    }
  }, [])

  const show = (next: number) => {
    const box = boxRef.current
    if (!box) return
    box.scrollLeft = next * box.clientWidth
    setPart(next)
  }

  return (
    <>
      <div className="file-preview-result-frame">
        <div className="file-preview-result" ref={boxRef}>
          {children}
        </div>
      </div>
      {partCount > 1 && (
        <div className="file-preview-pager">
          <button
            type="button"
            className="file-preview-pager-button"
            aria-label="변환 결과 이전 부분"
            disabled={part === 0}
            onClick={() => show(part - 1)}
          >
            <CaretLeftIcon aria-hidden="true" size={16} weight="bold" />
            이전
          </button>
          <span className="file-preview-pager-count" aria-live="polite">
            {part + 1} / {partCount}
          </span>
          <button
            type="button"
            className="file-preview-pager-button"
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

// 변환 완료 화면의 앞 몇 페이지 미리보기. 한 번에 한 페이지씩, 원본과 결과를 나란히 보여 준다.
function FilePreview({ fileId }: FilePreviewProps) {
  const [preview, setPreview] = useState<BackendPreviewResponse | null>(null)
  const [failed, setFailed] = useState(false)
  const [selectedTab, setSelectedTab] = useState('')
  // 완료 화면과 '지난 변환 미리보기' 창에 동시에 뜰 수 있어서 id가 겹치지 않게 한다.
  const uid = useId()
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const zoomButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    let cancelled = false
    getFilePreview(fileId)
      .then((data) => {
        if (cancelled) return
        setPreview(data)
        setSelectedTab(data.pages[0] ? `${data.pages[0].page_number}` : '')
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [fileId])

  const pages = preview?.pages ?? []
  const unit = preview?.file_type === 'pptx' ? '슬라이드' : '페이지'
  const tabs = pages.map((page) => `${page.page_number}`)
  const { getTabProps, panelProps } = useTabs({
    idPrefix: `file-preview${uid}`,
    tabs,
    selected: selectedTab,
    onSelect: setSelectedTab,
  })
  const page = pages.find((item) => `${item.page_number}` === selectedTab)

  if (failed) {
    // 미리보기가 안 돼도 다운로드는 그대로 할 수 있어서 짧게만 알린다.
    return <p className="file-preview-message">미리보기를 불러오지 못했어요. 파일은 아래에서 받을 수 있어요.</p>
  }
  if (!preview) {
    return (
      <div className="file-preview">
        <SkeletonList count={1} lines={6} label="미리보기를 불러오는 중" />
      </div>
    )
  }
  if (!page) return null

  const imageAlt =
    preview.file_type === 'pptx'
      ? `원본 ${page.page_number}번 슬라이드에서 꺼낸 그림`
      : `원본 ${page.page_number}페이지. 내용은 옆의 변환 결과에서 확인할 수 있어요.`
  const paragraphs = page.paragraphs.filter((paragraph) => paragraph.text.trim() !== '')

  return (
    <section className="file-preview" aria-labelledby={`${uid}-title`}>
      <h4 id={`${uid}-title`} className="file-preview-title">
        미리보기 <span className="file-preview-title-sub">앞 {pages.length}{unit}</span>
      </h4>

      <div className="file-preview-tabs" role="tablist" aria-label={`미리볼 ${unit}`}>
        {tabs.map((tab, index) => (
          <button key={tab} type="button" className="file-preview-tab" {...getTabProps(tab, index)}>
            {unit === '페이지' ? `${tab}페이지` : `슬라이드 ${tab}`}
          </button>
        ))}
      </div>

      <div className={page.image_url ? 'file-preview-panel has-image' : 'file-preview-panel'} {...panelProps}>
        <div className="file-preview-column">
          <p className="file-preview-label">{preview.file_type === 'pptx' ? '원본 속 그림' : '원본'}</p>
          {page.image_url ? (
            <>
              <img src={page.image_url} alt={imageAlt} className="file-preview-image" />
              <button
                ref={zoomButtonRef}
                type="button"
                className="file-preview-zoom-button"
                onClick={() => dialogRef.current?.showModal()}
              >
                <MagnifyingGlassPlusIcon aria-hidden="true" size={18} />
                원본 크게 보기
              </button>
            </>
          ) : (
            <p className="file-preview-message">이 {unit}에는 보여줄 원본 이미지가 없어요.</p>
          )}
        </div>

        <div className="file-preview-column">
          <p className="file-preview-label">변환 결과</p>
          {/* 페이지를 바꾸면 새로 그려서 첫 부분부터 다시 보여 준다. */}
          <PagedResult key={page.page_number}>
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <p key={index} className={paragraphClass(paragraph)}>
                  {paragraph.list_marker ? `${paragraph.list_marker} ` : ''}
                  {paragraph.text}
                </p>
              ))
            ) : (
              <p className="file-preview-message">이 {unit}에서 나온 내용이 없어요.</p>
            )}
          </PagedResult>
        </div>
      </div>

      {/* 브라우저 기본 대화상자: 포커스 가두기, Esc로 닫기, 뒤 화면 막기를 브라우저가 해 준다.
          바깥(어두운 부분)을 눌러도 닫히고, 닫히면 '원본 크게 보기' 버튼으로 돌아간다. */}
      {page.image_url && (
        <dialog
          ref={dialogRef}
          className="file-preview-dialog"
          aria-labelledby={`${uid}-dialog-title`}
          onClick={(event) => {
            if (event.target === dialogRef.current) dialogRef.current?.close()
          }}
          onClose={() => zoomButtonRef.current?.focus()}
        >
          <div className="file-preview-dialog-head">
            <h2 id={`${uid}-dialog-title`} className="file-preview-dialog-title">
              원본 {page.page_number}
              {unit === '페이지' ? '페이지' : '번 슬라이드'}
            </h2>
            <button type="button" className="file-preview-dialog-close" onClick={() => dialogRef.current?.close()}>
              <XIcon aria-hidden="true" size={20} />
              닫기
            </button>
          </div>
          <img src={page.image_url} alt={imageAlt} className="file-preview-dialog-image" />
        </dialog>
      )}
    </section>
  )
}

export default FilePreview
