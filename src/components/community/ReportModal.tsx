import { useState } from 'react'
import { createReport } from '../../api/communityApi'
import { REPORT_REASONS, type ReportReason, type ReportTargetType } from '../../types/report'

type ReportModalProps = {
  targetType: ReportTargetType
  targetId: number
  onClose: () => void
}

function ReportModal({ targetType, targetId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason>(REPORT_REASONS[0])
  const [detail, setDetail] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

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
      alert('신고가 접수되었습니다.')
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
        className="report-modal"
        role="dialog"
        aria-modal="true"
        aria-label="신고하기"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="report-title">{targetType === 'post' ? '게시글' : '댓글'} 신고</h3>

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
            maxLength={500}
          />

          {error && <p className="report-error">{error}</p>}

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
