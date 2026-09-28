export type ReportTargetType = 'post' | 'comment'
export type ReportReason = '스팸/광고' | '욕설/비방' | '음란물' | '기타'
export type ReportStatus = 'pending' | 'resolved' | 'rejected'

export const REPORT_REASONS: ReportReason[] = ['스팸/광고', '욕설/비방', '음란물', '기타']

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  pending: '대기',
  resolved: '처리완료',
  rejected: '기각',
}

export interface AdminReport {
  id: number
  targetType: ReportTargetType
  targetId: number
  targetPreview: string
  targetExists: boolean
  postId: number | null
  reason: string
  detail: string | null
  reporter: string
  status: ReportStatus
  createdAt: string
  handledAt: string
}

export interface AdminReportsResult {
  reports: AdminReport[]
  total: number
  pendingCount: number
  totalPages: number
  currentPage: number
}
