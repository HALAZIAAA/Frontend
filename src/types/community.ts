export type PostCategory = '공지' | '질문' | '팁' | '후기'
export type SortType = 'latest' | 'popular'

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

export interface GetPostsParams {
  category?: PostCategory | '전체'
  sort?: SortType
  page?: number
  keyword?: string
}

export interface GetPostsResult {
  posts: Post[]
  totalPages: number
  currentPage: number
}
