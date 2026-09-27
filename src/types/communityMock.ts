// [DEMO] communityMockApi.ts 전용 타입. 실제 화면은 types/community.ts를 쓴다.
import type { PostCategory } from './community'

export interface Comment {
  id: number
  author: string
  createdAt: string // "YYYY-MM-DD HH:mm"
  content: string
  likes: number
  parentId: number | null
}

export interface Post {
  id: number
  category: PostCategory
  isHot: boolean
  title: string
  preview: string
  content: string
  author: string
  createdAt: string // "YYYY-MM-DD"
  views: number
  likes: number
  comments: Comment[]
}

export interface GetPostsResult {
  posts: Post[]
  totalPages: number
  currentPage: number
}
