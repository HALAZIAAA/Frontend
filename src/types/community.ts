export type PostCategory = '공지' | '질문'

export interface Comment {
  id: number
  author: string
  authorId: number | null
  createdAt: string // "YYYY-MM-DD HH:mm" (한국시간)
  content: string
  likes: number
  likedByMe: boolean
  isMine: boolean
  // 답글이 달린 채로 지워진 댓글. 자리만 남아 있다.
  isDeleted: boolean
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

export interface PostImage {
  id: number
  url: string
}

export interface PostDetail extends PostSummary {
  content: string
  images: PostImage[]
  comments: Comment[]
}

export interface GetPostsParams {
  category?: PostCategory | '전체'
  page?: number
  keyword?: string
  author?: 'me'
}

export interface GetPostsResult {
  posts: PostSummary[]
  totalPages: number
  currentPage: number
}

// 마이페이지 "내가 쓴 댓글" - 어느 글에 단 댓글인지 같이 온다.
export interface MyComment {
  id: number
  content: string
  createdAt: string // "YYYY-MM-DD HH:mm" (한국시간)
  likes: number
  postId: number
  postTitle: string
}

export interface MyCommentsResult {
  comments: MyComment[]
  total: number
}
