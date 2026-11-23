import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { BACKEND_ORIGIN } from '../../api/fileApi'
import { useFeedback } from '../../lib/feedback'

const CHECK_TIMEOUT_MS = 6000

// 백엔드의 /health에 닿는지 본다. 응답이 없거나(꺼짐·시간 초과) 서버 오류(5xx)일 때만 꺼진 것으로 본다.
// 이 확인으로는 백엔드 뒤의 AI 서버가 꺼졌는지까지는 알 수 없다.
async function isBackendDown(signal: AbortSignal): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_ORIGIN}/health`, { signal, cache: 'no-store' })
    return response.status >= 500
  } catch {
    return true
  }
}

// 변환 서버에 연결할 수 없을 때만 보이는 안내. 파일을 올리고 한참 기다린 뒤에야 실패를 알게 되지 않도록
// 첫 화면에 들어왔을 때 먼저 알려 주고, 서버 없이도 볼 수 있는 소개 화면의 예시로 안내한다.
function ServerNotice() {
  const { toast } = useFeedback()
  const [down, setDown] = useState(false)
  const [checking, setChecking] = useState(false)
  const [attempt, setAttempt] = useState(0) // '다시 확인'을 누를 때마다 올라가 확인을 다시 한다

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS)
    let active = true

    void isBackendDown(controller.signal).then((isDown) => {
      if (!active) return
      setDown(isDown)
      setChecking(false)
      // 처음 들어왔을 때는 조용히 넘어가고, 직접 다시 확인해서 연결됐을 때만 알린다.
      if (!isDown && attempt > 0) toast('변환 서버에 다시 연결됐어요.', 'success')
    })

    return () => {
      active = false
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [attempt, toast])

  const recheck = () => {
    setChecking(true)
    setAttempt((count) => count + 1)
  }

  // 안내가 나타날 때 스크린리더가 읽도록, 알림 영역 자체는 늘 화면에 둔다.
  return (
    <div role="status">
      {down && (
        <div className="server-notice">
          <WarningCircleIcon aria-hidden="true" size={24} weight="fill" className="server-notice-icon" />
          <div className="server-notice-text">
            <p className="server-notice-title">지금은 변환 서버에 연결할 수 없어요</p>
            <p className="server-notice-body">
              파일 변환은 잠시 뒤에 다시 해 주세요. 그동안 소개 화면에서 변환 결과 예시를 살펴볼 수 있어요.
            </p>
          </div>
          <div className="server-notice-actions">
            <Link to="/welcome" className="server-notice-link">
              예시로 살펴보기
              <ArrowRightIcon aria-hidden="true" size={18} />
            </Link>
            <button type="button" className="server-notice-retry" onClick={recheck} disabled={checking}>
              {checking ? '확인하는 중' : '다시 확인'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServerNotice
