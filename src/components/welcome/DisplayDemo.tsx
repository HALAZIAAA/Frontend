import { useState } from 'react'
import type { TextSize } from '../../lib/displaySettings'

const TEXT_SIZES: Array<{ value: TextSize; label: string }> = [
  { value: 'normal', label: '기본' },
  { value: 'large', label: '크게' },
  { value: 'xlarge', label: '아주 크게' },
]

// 화면 설정을 이 예시 상자 안에서만 바꿔 본다. 실제 설정(위 메뉴의 '화면 설정')은 건드리지 않는다.
function DisplayDemo() {
  const [highContrast, setHighContrast] = useState(false)
  const [textSize, setTextSize] = useState<TextSize>('normal')

  return (
    <div className="demo-display">
      <div className="demo-display-controls">
        <button
          type="button"
          role="switch"
          aria-checked={highContrast}
          className="demo-switch"
          onClick={() => setHighContrast((value) => !value)}
        >
          <span className="demo-switch-track" aria-hidden="true">
            <span className="demo-switch-thumb" />
          </span>
          고대비 모드
        </button>

        <div className="demo-chip-row" role="group" aria-label="글자 크기">
          {TEXT_SIZES.map((option) => (
            <button
              key={option.value}
              type="button"
              className="demo-chip"
              aria-pressed={textSize === option.value}
              onClick={() => setTextSize(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`demo-display-sample size-${textSize} ${highContrast ? 'is-contrast' : ''}`}>
        <p className="demo-display-title">변환된 파일 목록</p>
        <div className="demo-display-row">
          <span className="demo-display-name">사회학원론_3주차.pdf</span>
          <span className="demo-display-badge">완료</span>
        </div>
        <p className="demo-display-text">그림 9장과 표 2개를 글로 설명했어요. 받기 전에 미리보기로 확인해 보세요.</p>
        <span className="demo-display-button">DOCX 다운로드</span>
      </div>

      <p className="demo-subtle">
        실제 설정은 화면 맨 위 메뉴의 &lsquo;화면 설정&rsquo;에서 바꾸고, 이 브라우저에 저장돼요.
      </p>
    </div>
  )
}

export default DisplayDemo
