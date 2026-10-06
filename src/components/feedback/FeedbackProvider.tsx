import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { XIcon } from '@phosphor-icons/react'
import { FeedbackContext, type ConfirmOptions, type ToastTone } from '../../lib/feedback'
import '../../styles/feedback.css'

type Toast = { id: number; message: string; tone: ToastTone }
type PendingConfirm = { options: ConfirmOptions; resolve: (ok: boolean) => void }

const TOAST_MS = 5000
// 확인 창 안에서 Tab으로 갈 수 있는 것들
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [pending, setPending] = useState<PendingConfirm | null>(null)
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      const id = nextId.current++
      setToasts((prev) => [...prev, { id, message, tone }])
      window.setTimeout(() => dismiss(id), TOAST_MS)
    },
    [dismiss],
  )

  const confirm = useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ options, resolve })),
    [],
  )

  const close = (ok: boolean) => {
    pending?.resolve(ok)
    setPending(null)
  }

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm])
  const polite = toasts.filter((item) => item.tone !== 'error')
  const urgent = toasts.filter((item) => item.tone === 'error')

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      {/* 알림 영역은 늘 자리를 둬야 나중에 들어온 문장을 스크린리더가 읽는다. */}
      <div className="toast-stack">
        <div role="status" className="toast-region">
          {polite.map((item) => (
            <ToastItem key={item.id} toast={item} onClose={() => dismiss(item.id)} />
          ))}
        </div>
        <div role="alert" className="toast-region">
          {urgent.map((item) => (
            <ToastItem key={item.id} toast={item} onClose={() => dismiss(item.id)} />
          ))}
        </div>
      </div>

      {pending && <ConfirmDialog options={pending.options} onClose={close} />}
    </FeedbackContext.Provider>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  return (
    <div className={`toast toast-${toast.tone}`}>
      <p className="toast-message">{toast.message}</p>
      <button type="button" className="toast-close" onClick={onClose} aria-label="알림 닫기">
        <XIcon aria-hidden="true" size={18} />
      </button>
    </div>
  )
}

function ConfirmDialog({
  options,
  onClose,
}: {
  options: ConfirmOptions
  onClose: (ok: boolean) => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // 열리면 실수로 확정하지 않도록 '취소'에 포커스를 두고, 닫히면 창을 연 버튼으로 돌려준다.
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialogRef.current?.querySelector<HTMLButtonElement>('.confirm-cancel')?.focus()
    return () => opener?.focus()
  }, [])

  // Esc로 취소하고, Tab은 창 밖으로 나가지 않고 창 안에서만 돈다.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose(false)
      return
    }
    if (event.key !== 'Tab' || !dialogRef.current) return
    const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
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

  return (
    <div className="confirm-backdrop" role="presentation" onClick={() => onClose(false)}>
      <div
        ref={dialogRef}
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={options.message ? 'confirm-message' : undefined}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h2 id="confirm-title" className="confirm-title">
          {options.title}
        </h2>
        {options.message && (
          <p id="confirm-message" className="confirm-message">
            {options.message}
          </p>
        )}
        <div className="confirm-actions">
          <button type="button" className="confirm-cancel" onClick={() => onClose(false)}>
            {options.cancelLabel ?? '취소'}
          </button>
          <button
            type="button"
            className={options.danger ? 'confirm-ok danger' : 'confirm-ok'}
            onClick={() => onClose(true)}
          >
            {options.confirmLabel ?? '확인'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FeedbackProvider
