import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'

const CONFIRM_WORD = '탈퇴'

function DeleteAccountSection() {
  const { user, deleteAccount } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  // 구글로만 가입한 계정은 비밀번호가 없어서 확인 문구만 받는다.
  const needsPassword = Boolean(user && user.provider.includes('local'))

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setError('')

    if (confirmText.trim() !== CONFIRM_WORD) {
      setError(`확인을 위해 '${CONFIRM_WORD}'를 입력해주세요.`)
      return
    }
    if (needsPassword && !password) {
      setError('비밀번호를 입력해주세요.')
      return
    }
    if (
      !window.confirm(
        '정말 탈퇴하시겠습니까?\n작성한 글과 댓글, 변환 파일이 모두 삭제되며 되돌릴 수 없습니다.',
      )
    ) {
      return
    }

    setDeleting(true)
    const result = await deleteAccount(needsPassword ? password : null)
    setDeleting(false)

    if (result.ok) {
      alert('탈퇴가 완료되었습니다.')
      navigate('/')
    } else {
      setError(result.error ?? '회원 탈퇴에 실패했습니다.')
    }
  }

  return (
    <section className="mypage-card mypage-danger" aria-label="회원 탈퇴">
      <h2 className="mypage-section-title danger">회원 탈퇴</h2>
      <p className="mypage-section-hint">
        탈퇴하면 작성한 글과 댓글, 변환 파일이 모두 삭제됩니다. 되돌릴 수 없습니다.
        <br />
        다른 사람이 답글을 단 내 댓글은 내용만 지워지고 자리는 남습니다.
      </p>

      {!open ? (
        <button
          type="button"
          className="mypage-danger-button"
          onClick={() => setOpen(true)}
        >
          회원 탈퇴
        </button>
      ) : (
        <form className="mypage-danger-form" onSubmit={handleSubmit} noValidate>
          {needsPassword && (
            <input
              type="password"
              className="mypage-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호"
              autoComplete="current-password"
              aria-label="비밀번호"
            />
          )}
          <input
            type="text"
            className="mypage-input"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder={`확인을 위해 '${CONFIRM_WORD}' 입력`}
            aria-label="탈퇴 확인 문구"
          />

          <div className="mypage-danger-actions">
            <button
              type="button"
              className="mypage-save-button ghost"
              onClick={() => {
                setOpen(false)
                setPassword('')
                setConfirmText('')
                setError('')
              }}
            >
              취소
            </button>
            <button type="submit" className="mypage-danger-button" disabled={deleting}>
              {deleting ? '처리 중...' : '탈퇴하기'}
            </button>
          </div>
        </form>
      )}

      <div role="alert">
        {error && <p className="mypage-message error">{error}</p>}
      </div>
    </section>
  )
}

export default DeleteAccountSection
