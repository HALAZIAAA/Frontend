import { createContext, useContext } from 'react'

export type ToastTone = 'success' | 'error' | 'info'

export type ConfirmOptions = {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  // 삭제·정지·탈퇴처럼 되돌릴 수 없는 동작이면 확인 버튼을 빨갛게 한다.
  danger?: boolean
}

type FeedbackValue = {
  // 화면 아래에 잠깐 뜨는 알림. 스크린리더는 성공·안내는 차례가 오면, 실패는 바로 읽는다.
  toast: (message: string, tone?: ToastTone) => void
  // 브라우저 confirm() 대신 쓰는 확인 창. 확인을 누르면 true.
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

export const FeedbackContext = createContext<FeedbackValue | null>(null)

export function useFeedback(): FeedbackValue {
  const value = useContext(FeedbackContext)
  if (!value) throw new Error('useFeedback must be used within FeedbackProvider')
  return value
}
