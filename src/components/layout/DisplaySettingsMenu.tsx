import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import { SlidersHorizontalIcon } from '@phosphor-icons/react'
import {
  readDisplaySettings,
  saveDisplaySettings,
  type DisplaySettings,
  type TextSize,
} from '../../lib/displaySettings'

const PANEL_ID = 'display-settings-panel'
const TEXT_SIZES: Array<{ value: TextSize; label: string }> = [
  { value: 'normal', label: '기본' },
  { value: 'large', label: '크게' },
  { value: 'xlarge', label: '아주 크게' },
]

// 헤더의 '화면 설정'. 고대비 모드와 글자 크기를 바꾼다. (열고 닫는 버튼 + 펼쳐지는 패널)
function DisplaySettingsMenu() {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<DisplaySettings>(readDisplaySettings)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // 바깥을 누르면 닫는다.
  useEffect(() => {
    if (!open) return
    const handleOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const update = (next: DisplaySettings) => {
    setSettings(next)
    saveDisplaySettings(next)
  }

  // Esc로 닫고 설정 버튼으로 돌아간다.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (open && event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      buttonRef.current?.focus()
    }
  }

  // Tab으로 패널 밖으로 나가면 닫는다.
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget
    if (open && next instanceof Node && !wrapperRef.current?.contains(next)) setOpen(false)
  }

  return (
    <div className="display-settings" ref={wrapperRef} onKeyDown={handleKeyDown} onBlur={handleBlur}>
      <button
        ref={buttonRef}
        type="button"
        className="display-settings-button"
        aria-expanded={open}
        aria-controls={PANEL_ID}
        onClick={() => setOpen((value) => !value)}
      >
        <SlidersHorizontalIcon aria-hidden="true" size={20} />
        {/* 아주 좁은 화면에서는 글자를 숨기고 아이콘만 보이지만, 버튼 이름은 그대로 읽힌다 */}
        <span className="display-settings-label">화면 설정</span>
      </button>

      <div id={PANEL_ID} className="display-settings-panel" hidden={!open}>
        <button
          type="button"
          role="switch"
          aria-checked={settings.highContrast}
          className="display-switch"
          onClick={() => update({ ...settings, highContrast: !settings.highContrast })}
        >
          <span className="display-switch-text">
            <span className="display-switch-label">고대비 모드</span>
            <span className="display-switch-hint">글자와 테두리를 더 진하게 보여줘요</span>
          </span>
          {/* 켜짐·꺼짐을 색만이 아니라 글자로도 보여준다 */}
          <span className="display-switch-state" aria-hidden="true">
            {settings.highContrast ? '켜짐' : '꺼짐'}
          </span>
        </button>

        <fieldset className="display-size">
          <legend className="display-size-legend">글자 크기</legend>
          <div className="display-size-options">
            {TEXT_SIZES.map((option) => (
              <label key={option.value} className="display-size-option">
                <input
                  type="radio"
                  name="display-text-size"
                  value={option.value}
                  checked={settings.textSize === option.value}
                  onChange={() => update({ ...settings, textSize: option.value })}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  )
}

export default DisplaySettingsMenu
