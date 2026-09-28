import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markRead,
} from '../../api/notificationApi'
import type { AppNotification } from '../../types/notification'

const POLL_INTERVAL = 30_000 // 30초마다 안 읽은 개수만 확인

function NotificationBell() {
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

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

  return (
    <div className="notification-area" ref={wrapperRef}>
      <button
        type="button"
        className="notification-bell"
        onClick={handleToggle}
        aria-label={unread > 0 ? `읽지 않은 알림 ${unread}개` : '알림'}
      >
        🔔
        {unread > 0 && (
          <span className="notification-badge">{unread > 99 ? '99+' : unread}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown" role="dialog" aria-label="알림 목록">
          <div className="notification-dropdown-header">
            <span>알림</span>
            {unread > 0 && (
              <button type="button" className="notification-all-read" onClick={handleAllRead}>
                모두 읽음
              </button>
            )}
          </div>

          {loading ? (
            <p className="notification-empty">불러오는 중...</p>
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
