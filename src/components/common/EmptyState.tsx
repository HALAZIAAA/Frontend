import type { ReactNode } from 'react'

type EmptyStateProps = {
  icon: ReactNode
  title: string
  description?: string
  // 다음에 할 일로 이어 주는 버튼이나 링크
  action?: ReactNode
}

// 목록이 비었을 때: 무엇이 없는지 + 왜/어떻게 채우는지 + 바로 할 수 있는 동작
function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon" aria-hidden="true">
        {icon}
      </span>
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}

export default EmptyState
