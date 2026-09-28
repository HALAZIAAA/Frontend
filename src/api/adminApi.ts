import { BACKEND_ORIGIN } from './fileApi'
import { formatDate } from '../lib/formatDate'
import type {
  AdminReport,
  AdminReportsResult,
  ReportStatus,
  ReportTargetType,
} from '../types/report'
import type {
  AdminPost,
  AdminPostsResult,
  AdminUser,
  AdminUsersResult,
  UserRole,
} from '../types/admin'

const API_BASE = `${BACKEND_ORIGIN}/api/v1/admin`

type RawAdminUser = {
  id: number
  email: string
  nickname: string
  role: string
  provider: string
  is_active: boolean
  created_at: string | null
  post_count: number
  comment_count: number
}

type RawAdminPost = {
  id: number
  title: string
  category: string
  author: string
  author_id: number
  author_active: boolean
  created_at: string | null
  views: number
  comment_count: number
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: string; message?: string }
    return data.detail ?? data.message ?? `요청 실패 (${res.status})`
  } catch {
    return `요청 실패 (${res.status})`
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: init.body
      ? { 'Content-Type': 'application/json', ...(init.headers ?? {}) }
      : init.headers,
  })

  if (!res.ok) {
    throw new Error(await parseError(res))
  }
  return (await res.json()) as T
}

function toUser(raw: RawAdminUser): AdminUser {
  return {
    id: raw.id,
    email: raw.email,
    nickname: raw.nickname,
    role: raw.role as UserRole,
    provider: raw.provider,
    isActive: raw.is_active,
    createdAt: formatDate(raw.created_at),
    postCount: raw.post_count,
    commentCount: raw.comment_count,
  }
}

function toPost(raw: RawAdminPost): AdminPost {
  return {
    id: raw.id,
    title: raw.title,
    category: raw.category,
    author: raw.author,
    authorId: raw.author_id,
    authorActive: raw.author_active,
    createdAt: formatDate(raw.created_at),
    views: raw.views,
    commentCount: raw.comment_count,
  }
}

function buildQuery(keyword: string | undefined, page: number): string {
  const query = new URLSearchParams()
  query.set('page', String(Math.max(1, page)))
  const trimmed = keyword?.trim()
  if (trimmed) {
    query.set('keyword', trimmed)
  }
  return query.toString()
}

export async function getUsers(keyword: string, page: number): Promise<AdminUsersResult> {
  const raw = await request<{
    users: RawAdminUser[]
    total: number
    total_pages: number
    current_page: number
  }>(`/users?${buildQuery(keyword, page)}`)

  return {
    users: raw.users.map(toUser),
    total: raw.total,
    totalPages: raw.total_pages,
    currentPage: raw.current_page,
  }
}

// 정지/해제. 정지하면 서버가 그 사람 세션까지 끊는다.
export async function setUserActive(userId: number, isActive: boolean): Promise<AdminUser> {
  return toUser(
    await request<RawAdminUser>(`/users/${userId}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    }),
  )
}

export async function setUserRole(userId: number, role: UserRole): Promise<AdminUser> {
  return toUser(
    await request<RawAdminUser>(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  )
}

// 관리자용 전체 글 목록. 정지된 계정의 글도 포함된다.
export async function getAdminPosts(keyword: string, page: number): Promise<AdminPostsResult> {
  const raw = await request<{
    posts: RawAdminPost[]
    total: number
    total_pages: number
    current_page: number
  }>(`/posts?${buildQuery(keyword, page)}`)

  return {
    posts: raw.posts.map(toPost),
    total: raw.total,
    totalPages: raw.total_pages,
    currentPage: raw.current_page,
  }
}

type RawAdminReport = {
  id: number
  target_type: string
  target_id: number
  target_preview: string
  target_exists: boolean
  post_id: number | null
  reason: string
  detail: string | null
  reporter: string
  status: string
  created_at: string | null
  handled_at: string | null
}

function toReport(raw: RawAdminReport): AdminReport {
  return {
    id: raw.id,
    targetType: raw.target_type as ReportTargetType,
    targetId: raw.target_id,
    targetPreview: raw.target_preview,
    targetExists: raw.target_exists,
    postId: raw.post_id,
    reason: raw.reason,
    detail: raw.detail,
    reporter: raw.reporter,
    status: raw.status as ReportStatus,
    createdAt: formatDate(raw.created_at),
    handledAt: formatDate(raw.handled_at),
  }
}

export async function getReports(
  status: ReportStatus | '',
  page: number,
): Promise<AdminReportsResult> {
  const query = new URLSearchParams()
  query.set('page', String(Math.max(1, page)))
  if (status) {
    query.set('status', status)
  }

  const raw = await request<{
    reports: RawAdminReport[]
    total: number
    pending_count: number
    total_pages: number
    current_page: number
  }>(`/reports?${query.toString()}`)

  return {
    reports: raw.reports.map(toReport),
    total: raw.total,
    pendingCount: raw.pending_count,
    totalPages: raw.total_pages,
    currentPage: raw.current_page,
  }
}

export async function setReportStatus(
  reportId: number,
  status: ReportStatus,
): Promise<AdminReport> {
  return toReport(
    await request<RawAdminReport>(`/reports/${reportId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  )
}
