import { useEffect, useState } from 'react'
import Pagination from '../community/Pagination'
import { getUsers, setUserActive, setUserRole } from '../../api/adminApi'
import type { AdminUser } from '../../types/admin'

type AdminUsersTabProps = {
  // 자기 자신은 정지·강등할 수 없어서 버튼을 잠근다.
  myId: number
}

function describeProvider(provider: string): string {
  const hasLocal = provider.includes('local')
  const hasGoogle = provider.includes('google')
  if (hasLocal && hasGoogle) return '이메일 + 구글'
  if (hasGoogle) return '구글'
  return '이메일'
}

function AdminUsersTab({ myId }: AdminUsersTabProps) {
  const [keyword, setKeyword] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(keyword)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [keyword])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getUsers(searchKeyword, page)
      .then((result) => {
        if (cancelled) return
        setUsers(result.users)
        setTotal(result.total)
        setTotalPages(result.totalPages)
        setPage(result.currentPage)
        setError('')
      })
      .catch((err) => {
        if (cancelled) return
        setUsers([])
        setError(err instanceof Error ? err.message : '사용자를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [searchKeyword, page])

  // 바뀐 한 명만 목록에서 갈아끼운다. (전체를 다시 부르지 않는다)
  const replaceUser = (updated: AdminUser) => {
    setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
  }

  const handleToggleActive = async (target: AdminUser) => {
    const action = target.isActive ? '정지' : '정지 해제'
    if (!window.confirm(`'${target.nickname}' 계정을 ${action}할까요?`)) return

    setBusyId(target.id)
    try {
      replaceUser(await setUserActive(target.id, !target.isActive))
    } catch (err) {
      alert(err instanceof Error ? err.message : `${action}에 실패했습니다.`)
    } finally {
      setBusyId(null)
    }
  }

  const handleToggleRole = async (target: AdminUser) => {
    const nextRole = target.role === 'admin' ? 'user' : 'admin'
    const action = nextRole === 'admin' ? '관리자로 임명' : '관리자 권한 회수'
    if (!window.confirm(`'${target.nickname}' 계정을 ${action}할까요?`)) return

    setBusyId(target.id)
    try {
      replaceUser(await setUserRole(target.id, nextRole))
    } catch (err) {
      alert(err instanceof Error ? err.message : '권한 변경에 실패했습니다.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <div className="admin-toolbar">
        <input
          type="text"
          className="admin-search-input"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="닉네임 또는 이메일 검색..."
          aria-label="사용자 검색"
        />
        <span className="admin-total">전체 {total}명</span>
      </div>

      {loading ? (
        <p className="admin-empty">불러오는 중...</p>
      ) : error ? (
        <p className="admin-empty">{error}</p>
      ) : users.length === 0 ? (
        <p className="admin-empty">조건에 맞는 사용자가 없습니다.</p>
      ) : (
        <>
          <ul className="admin-list">
            {users.map((item) => {
              const isMe = item.id === myId
              const busy = busyId === item.id

              return (
                <li key={item.id} className="admin-row">
                  <div className="admin-row-main">
                    <span className="admin-row-title">
                      {item.nickname}
                      {item.role === 'admin' && <span className="admin-badge role">관리자</span>}
                      {!item.isActive && <span className="admin-badge stopped">정지됨</span>}
                      {isMe && <span className="admin-badge me">나</span>}
                    </span>
                    <span className="admin-row-sub">
                      {item.email} · {describeProvider(item.provider)} · 가입 {item.createdAt} · 글{' '}
                      {item.postCount} · 댓글 {item.commentCount}
                    </span>
                  </div>

                  <div className="admin-row-actions">
                    <button
                      type="button"
                      className="admin-action-button"
                      onClick={() => handleToggleRole(item)}
                      disabled={isMe || busy}
                      title={isMe ? '자기 자신의 권한은 바꿀 수 없습니다.' : undefined}
                    >
                      {item.role === 'admin' ? '권한 회수' : '관리자 임명'}
                    </button>
                    <button
                      type="button"
                      className={
                        item.isActive
                          ? 'admin-action-button danger'
                          : 'admin-action-button restore'
                      }
                      onClick={() => handleToggleActive(item)}
                      disabled={isMe || busy}
                      title={isMe ? '자기 자신은 정지할 수 없습니다.' : undefined}
                    >
                      {item.isActive ? '정지' : '정지 해제'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </>
  )
}

export default AdminUsersTab
