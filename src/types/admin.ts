export type UserRole = 'user' | 'admin'

export interface AdminUser {
  id: number
  email: string
  nickname: string
  role: UserRole
  provider: string
  isActive: boolean
  createdAt: string // "YYYY-MM-DD" (한국시간)
  postCount: number
  commentCount: number
}

export interface AdminUsersResult {
  users: AdminUser[]
  total: number
  totalPages: number
  currentPage: number
}

export interface AdminPost {
  id: number
  title: string
  category: string
  author: string
  authorId: number
  // 작성자가 정지 상태면 이 글은 커뮤니티에서 숨겨져 있다.
  authorActive: boolean
  createdAt: string
  views: number
  commentCount: number
}

export interface AdminPostsResult {
  posts: AdminPost[]
  total: number
  totalPages: number
  currentPage: number
}
