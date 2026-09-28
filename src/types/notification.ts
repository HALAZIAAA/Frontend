export type NotificationType = 'comment' | 'reply' | 'post_removed' | 'comment_removed'

export interface AppNotification {
  id: number
  type: NotificationType
  message: string
  link: string | null
  isRead: boolean
  createdAt: string // "YYYY-MM-DD HH:mm" (한국시간)
}

export interface NotificationList {
  notifications: AppNotification[]
  unreadCount: number
}
