import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { createReport } from '../../api/communityApi'
import { useFeedback } from '../../lib/feedback'
import { REPORT_REASONS, type ReportReason, type ReportTargetType } from '../../types/report'

type ReportModalProps = {
  targetType: ReportTargetType
  targetId: number
  onClose: () => void
}

// 창 안에서 Tab으로 갈 수 있는 것들
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function ReportModal({ targetType, targetId, onClose }: ReportModalProps) {
  const { toast } = useFeedback()
  const [reason, setReason] = useState<ReportReason>(REPORT_REASONS[0])
  const [detail, setDetail] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // 창이 열리면 포커스를 창 안(선택된 사유)으로 옮기고, 닫히면 창을 연 버튼(🚩)으로 돌려준다.
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    modalRef.current?.querySelector<HTMLInputElement>('input[type="radio"]:checked')?.focus()
    return () => opener?.focus()
  }, [])

  // Esc로 닫고, Tab은 창 밖으로 나가지 않고 창 안에서만 돈다.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }
    if (event.key !== 'Tab' || !modalRef.current) return

    // 라디오는 묶음에서 선택된 것 하나만 Tab으로 간다. (나머지는 ↑/↓로 고른다)
    const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (element) =>
        !element.hasAttribute('disabled') &&
        !(element instanceof HTMLInputElement && element.type === 'radio' && !element.checked),
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setError('')

    if (reason === '기타' && !detail.trim()) {
      setError("'기타'를 선택하면 사유를 적어주세요.")
      return
    }

    setSending(true)
    try {
      await createReport({ targetType, targetId, reason, detail })
      toast('신고가 접수되었습니다.', 'success')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '신고에 실패했습니다.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="report-backdrop" onClick={onClose} role="presentation">
      <div
        ref={modalRef}
        className="report-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h3 id="report-modal-title" className="report-title">
          {targetType === 'post' ? '게시글' : '댓글'} 신고
        </h3>

        <form className="report-form" onSubmit={handleSubmit} noValidate>
          <fieldset className="report-reasons">
            <legend className="report-legend">사유를 선택해주세요</legend>
            {REPORT_REASONS.map((item) => (
              <label key={item} className="report-reason-option">
                <input
                  type="radio"
                  name="report-reason"
                  value={item}
                  checked={reason === item}
                  onChange={() => setReason(item)}
                />
                {item}
              </label>
            ))}
          </fieldset>

          <textarea
            className="report-detail"
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
            placeholder={reason === '기타' ? '사유를 적어주세요 (필수)' : '자세한 내용 (선택)'}
            aria-label="신고 상세 내용"
            maxLength={500}
          />

          {error && (
            <p className="report-error" role="alert">
              {error}
            </p>
          )}

          <div className="report-actions">
            <button type="button" className="report-cancel" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="report-submit" disabled={sending}>
              {sending ? '접수 중...' : '신고하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReportModal
