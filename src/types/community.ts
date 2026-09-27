export type PostCategory = '공지' | '질문' | '팁' | '후기'
export type SortType = 'latest' | 'popular'

export interface Comment {
  id: number
  author: string
  authorId: number
  createdAt: string // "YYYY-MM-DD HH:mm" (한국시간)
  content: string
  likes: number
  likedByMe: boolean
  isMine: boolean
  parentId: number | null
}

// 목록 카드에 쓰는 형태. 본문과 댓글은 상세에서만 온다.
export interface PostSummary {
  id: number
  category: PostCategory
  isHot: boolean
  title: string
  preview: string
  author: string
  authorId: number
  createdAt: string // "YYYY-MM-DD" (한국시간)
  views: number
  likes: number
  likedByMe: boolean
  isMine: boolean
  commentCount: number
}

export interface PostDetail extends PostSummary {
  content: string
  comments: Comment[]
}

export interface GetPostsParams {
  category?: PostCategory | '전체'
  sort?: SortType
  page?: number
  keyword?: string
  author?: 'me'
}

export interface GetPostsResult {
  posts: PostSummary[]
  totalPages: number
  currentPage: number
}
