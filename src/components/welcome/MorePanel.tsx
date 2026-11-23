import { useId, useRef, useState, type ReactNode } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react'

// 파란 버튼을 눌러야 자세한 설명이 펼쳐지는 칸. 소개 화면이 길어지지 않게 AI 모델 섹션에서 쓴다.
function MorePanel({ label, hint, children }: { label: string; hint: string; children: ReactNode }) {
  const panelId = useId()
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  // 맨 아래 '접기'를 누르면 긴 설명과 그 버튼이 함께 사라진다. 처음 눌렀던 파란 버튼으로 돌아가 읽던 자리를 잃지 않게 한다.
  const closeFromBottom = () => {
    setOpen(false)
    openButtonRef.current?.focus({ preventScroll: true })
    openButtonRef.current?.scrollIntoView({ block: 'center' })
  }

  return (
    <div className="welcome-folds">
      <div className="welcome-more">
        <button
          type="button"
          ref={openButtonRef}
          className="welcome-primary-button welcome-more-button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? '자세한 설명 접기' : label}
          <CaretDownIcon aria-hidden="true" size={18} weight="bold" className="welcome-more-caret" />
        </button>
        <p className="welcome-more-hint">{hint}</p>
      </div>

      <div id={panelId} className="welcome-more-panel" hidden={!open}>
        {children}
        <div className="welcome-more-end">
          <button type="button" className="demo-ghost-button" onClick={closeFromBottom}>
            자세한 설명 접기
          </button>
        </div>
      </div>
    </div>
  )
}

export default MorePanel
