import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markRead,
} from '../../api/notificationApi'
import type { AppNotification } from '../../types/notification'
import { BellIcon } from '@phosphor-icons/react'
import { SkeletonList } from '../common/Skeleton'

const POLL_INTERVAL = 30_000 // 30초마다 안 읽은 개수만 확인
const DROPDOWN_ID = 'notification-dropdown'

function NotificationBell() {
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 개수 폴링
  useEffect(() => {
    let cancelled = false

    const check = () => {
      getUnreadCount()
        .then((count) => {
          if (!cancelled) setUnread(count)
        })
        .catch(() => {
          // 로그아웃 등으로 실패하면 조용히 넘어간다.
        })
    }

    check()
    const timer = setInterval(check, POLL_INTERVAL)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  // 바깥을 누르면 닫기
  useEffect(() => {
    if (!open) return

    const handleOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  // 목록을 다 불러오면 첫 알림(없으면 알림 창 자체)으로 포커스를 옮긴다. 바로 ↑/↓로 훑을 수 있게.
  useEffect(() => {
    if (!open || loading) return
    const first = dropdownRef.current?.querySelector<HTMLButtonElement>('.notification-item')
    ;(first ?? dropdownRef.current)?.focus()
  }, [open, loading])

  const handleToggle = async () => {
    if (open) {
      setOpen(false)
      return
    }

    setOpen(true)
    setLoading(true)
    try {
      const result = await getNotifications()
      setItems(result.notifications)
      setUnread(result.unreadCount)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleItemClick = async (item: AppNotification) => {
    if (!item.isRead) {
      try {
        setUnread(await markRead(item.id))
        setItems((prev) =>
          prev.map((row) => (row.id === item.id ? { ...row, isRead: true } : row)),
        )
      } catch {
        // 읽음 처리가 실패해도 이동은 시킨다.
      }
    }

    if (item.link) {
      setOpen(false)
      navigate(item.link)
    }
  }

  const handleAllRead = async () => {
    try {
      setUnread(await markAllRead())
      setItems((prev) => prev.map((row) => ({ ...row, isRead: true })))
    } catch {
      // 무시
    }
  }

  // Esc로 닫고 종 버튼으로 돌아간다. ↑/↓·Home/End로 알림 사이를 옮긴다.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return

    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      bellRef.current?.focus()
      return
    }

    const buttons = Array.from(
      dropdownRef.current?.querySelectorAll<HTMLButtonElement>('.notification-item') ?? [],
    )
    if (buttons.length === 0) return
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement)

    let next: number
    switch (event.key) {
      case 'ArrowDown':
        next = current < 0 ? 0 : (current + 1) % buttons.length
        break
      case 'ArrowUp':
        next = current < 0 ? buttons.length - 1 : (current - 1 + buttons.length) % buttons.length
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = buttons.length - 1
        break
      default:
        return
    }
    event.preventDefault()
    buttons[next].focus()
  }

  // Tab으로 알림 창 밖으로 나가면 닫는다. (마우스로 바깥을 누르는 건 위의 mousedown이 처리한다)
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget
    if (open && next instanceof Node && !wrapperRef.current?.contains(next)) {
      setOpen(false)
    }
  }

  return (
    <div
      className="notification-area"
      ref={wrapperRef}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      <button
        ref={bellRef}
        type="button"
        className="notification-bell"
        onClick={handleToggle}
        aria-label={unread > 0 ? `읽지 않은 알림 ${unread}개` : '알림'}
        aria-expanded={open}
        aria-controls={open ? DROPDOWN_ID : undefined}
      >
        <BellIcon aria-hidden="true" size={24} />
        {unread > 0 && (
          <span className="notification-badge">{unread > 99 ? '99+' : unread}</span>
        )}
      </button>

      {open && (
        <div
          id={DROPDOWN_ID}
          ref={dropdownRef}
          tabIndex={-1}
          className="notification-dropdown"
          role="dialog"
          aria-label="알림 목록"
        >
          <div className="notification-dropdown-header">
            <span>알림</span>
            {unread > 0 && (
              <button type="button" className="notification-all-read" onClick={handleAllRead}>
                모두 읽음
              </button>
            )}
          </div>

          {loading ? (
            <SkeletonList count={2} lines={2} label="알림을 불러오는 중" />
          ) : items.length === 0 ? (
            <p className="notification-empty">알림이 없습니다.</p>
          ) : (
            <ul className="notification-list">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={item.isRead ? 'notification-item' : 'notification-item unread'}
                    onClick={() => handleItemClick(item)}
                  >
                    {/* 안 읽음은 화면에선 색 띠로만 보여서 스크린리더용 글자를 따로 둔다 */}
                    {!item.isRead && <span className="sr-only">읽지 않음, </span>}
                    <span className="notification-message">{item.message}</span>
                    <span className="notification-date">{item.createdAt}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
