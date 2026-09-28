import { BACKEND_ORIGIN } from './fileApi'
import { formatDateTime } from '../lib/formatDate'
import type { AppNotification, NotificationList, NotificationType } from '../types/notification'

const API_BASE = `${BACKEND_ORIGIN}/api/v1/notifications`

type RawNotification = {
  id: number
  type: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string | null
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: string }
    return data.detail ?? `요청 실패 (${res.status})`
  } catch {
    return `요청 실패 (${res.status})`
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { ...init, credentials: 'include' })
  if (!res.ok) throw new Error(await parseError(res))
  return (await res.json()) as T
}

function toNotification(raw: RawNotification): AppNotification {
  return {
    id: raw.id,
    type: raw.type as NotificationType,
    message: raw.message,
    link: raw.link,
    isRead: raw.is_read,
    createdAt: formatDateTime(raw.created_at),
  }
}

export async function getNotifications(): Promise<NotificationList> {
  const raw = await request<{ notifications: RawNotification[]; unread_count: number }>('')
  return {
    notifications: raw.notifications.map(toNotification),
    unreadCount: raw.unread_count,
  }
}

// 30초마다 부르는 쪽. 개수만 받아온다.
export async function getUnreadCount(): Promise<number> {
  const raw = await request<{ unread_count: number }>('/unread-count')
  return raw.unread_count
}

export async function markRead(notificationId: number): Promise<number> {
  const raw = await request<{ unread_count: number }>(`/${notificationId}/read`, {
    method: 'PATCH',
  })
  return raw.unread_count
}

export async function markAllRead(): Promise<number> {
  const raw = await request<{ unread_count: number }>('/read-all', { method: 'POST' })
  return raw.unread_count
}
