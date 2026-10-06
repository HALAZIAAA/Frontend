import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import PostCard from '../../components/community/PostCard'
import Pagination from '../../components/community/Pagination'
import { getPosts } from '../../api/communityApi'
import type { PostCategory, PostSummary } from '../../types/community'
import '../../styles/navbar.css'
import '../../styles/community.css'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { ChatsCircleIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { SkeletonList } from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'

// 채용공고는 게시글이 아니라 외부 공고라서 따로 화면(/jobs)을 둔다.
type CategoryFilter = '전체' | PostCategory

const CATEGORY_OPTIONS: CategoryFilter[] = ['전체', '공지', '질문']

function CommunityPage() {
  useDocumentTitle('커뮤니티')
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('전체')
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('') // 타이핑이 멈춘 뒤의 검색어
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 글자를 칠 때마다 요청하지 않도록 0.3초 기다렸다가 검색어를 넘긴다.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(keyword)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [keyword])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getPosts({
      category: selectedCategory,
      page: currentPage,
      keyword: searchKeyword,
    })
      .then((result) => {
        if (cancelled) return
        setPosts(result.posts)
        setTotalPages(result.totalPages)
        setCurrentPage(result.currentPage)
        setError('')
      })
      .catch((err) => {
        if (cancelled) return
        setPosts([])
        setError(err instanceof Error ? err.message : '게시글을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedCategory, currentPage, searchKeyword])

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value as CategoryFilter)
    setCurrentPage(1)
  }

  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="community-page">
      <Navbar />

      <main className="page-container community-main">
        <h1 className="community-title">커뮤니티</h1>

        <section className="community-filter-card" aria-label="커뮤니티 필터 및 검색">
          <div className="community-search-row">
            <div className="community-search-input-wrapper">
              {/* 꾸밈용 아이콘이라 스크린리더가 '돋보기'라고 읽지 않게 한다. */}
              <MagnifyingGlassIcon className="community-search-icon" aria-hidden="true" size={20} />
              <input
                type="text"
                value={keyword}
                onChange={handleKeywordChange}
                placeholder="게시글 검색..."
                aria-label="게시글 검색"
                className="community-search-input"
              />
            </div>

            {/* 글은 항상 최신순. 검색어와 함께 카테고리로 좁혀 본다. */}
            <select
              className="community-category-select"
              value={selectedCategory}
              onChange={handleCategoryChange}
              aria-label="카테고리 선택"
            >
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <Link to="/community/write" className="community-write-button">
              글쓰기
            </Link>
          </div>
        </section>

        <section className="community-post-list" aria-label="커뮤니티 게시글 목록">
          {loading ? (
            <SkeletonList count={3} lines={4} card label="게시글을 불러오는 중" />
          ) : error ? (
            <div className="community-empty-state">{error}</div>
          ) : posts.length === 0 ? (
            keyword ? (
              <EmptyState
                icon={<MagnifyingGlassIcon size={28} />}
                title={`'${keyword}'에 맞는 글이 없어요`}
                description="다른 검색어로 찾아보거나 검색어를 지워 보세요."
                action={
                  <button type="button" className="empty-state-button" onClick={() => setKeyword('')}>
                    검색어 지우기
                  </button>
                }
              />
            ) : (
              <EmptyState
                icon={<ChatsCircleIcon size={28} />}
                title="아직 글이 없어요"
                description="첫 글을 남겨 보세요."
                action={
                  <Link to="/community/write" className="empty-state-button">
                    글쓰기
                  </Link>
                }
              />
            )
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </section>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </main>
    </div>
  )
}

export default CommunityPage
