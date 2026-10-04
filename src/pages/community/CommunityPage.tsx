import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import PostCard from '../../components/community/PostCard'
import Pagination from '../../components/community/Pagination'
import JobBoard from '../../components/community/JobBoard'
import { getPosts } from '../../api/communityApi'
import { useTabs } from '../../lib/useTabs'
import type { PostCategory, PostSummary, SortType } from '../../types/community'
import '../../styles/navbar.css'
import '../../styles/community.css'
import { useDocumentTitle } from '../../lib/useDocumentTitle'

// 채용공고는 게시글 카테고리가 아니라 외부 게시판에서 모아 온 공고 목록이다. 탭만 같은 줄에 둔다.
const JOBS_TAB = '채용공고'
type CommunityTab = '전체' | PostCategory | typeof JOBS_TAB

const CATEGORY_TABS: CommunityTab[] = ['전체', '공지', '질문', '팁', '후기', JOBS_TAB]

function CommunityPage() {
  useDocumentTitle('커뮤니티')
  const [selectedCategory, setSelectedCategory] = useState<CommunityTab>('전체')
  const [sort, setSort] = useState<SortType>('latest')
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
    // 채용공고 탭은 JobBoard가 따로 불러온다.
    if (selectedCategory === JOBS_TAB) return

    let cancelled = false
    setLoading(true)

    getPosts({
      category: selectedCategory,
      sort,
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
  }, [selectedCategory, sort, currentPage, searchKeyword])

  const handleCategoryChange = (category: CommunityTab) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  // ←/→·Home/End로 탭을 옮기고, Tab 키는 탭 줄에서 한 번만 멈춘다.
  const { getTabProps, panelProps } = useTabs({
    idPrefix: 'community',
    tabs: CATEGORY_TABS,
    selected: selectedCategory,
    onSelect: handleCategoryChange,
  })

  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value)
  }

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as SortType
    setSort(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const showJobs = selectedCategory === JOBS_TAB

  return (
    <div className="community-page">
      <Navbar menuItems={['파일 변환', '커뮤니티', '마이페이지']} />

      <main className="page-container community-main">
        <h1 className="community-title">커뮤니티</h1>

        <section className="community-filter-card" aria-label="커뮤니티 필터 및 검색">
          <div className="community-category-tabs" role="tablist" aria-label="커뮤니티 카테고리">
            {CATEGORY_TABS.map((category, index) => (
              <button
                key={category}
                type="button"
                className={
                  category === selectedCategory
                    ? 'community-category-tab active'
                    : 'community-category-tab'
                }
                {...getTabProps(category, index)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* 채용공고는 외부 공고라 검색·정렬·글쓰기가 필요 없다. */}
          {!showJobs && (
            <div className="community-search-row">
              <div className="community-search-input-wrapper">
                {/* 꾸밈용 아이콘이라 스크린리더가 '돋보기'라고 읽지 않게 한다. */}
                <span className="community-search-icon" aria-hidden="true">
                  🔍
                </span>
                <input
                  type="text"
                  value={keyword}
                  onChange={handleKeywordChange}
                  placeholder="게시글 검색..."
                  aria-label="게시글 검색"
                  className="community-search-input"
                />
              </div>

              <select
                className="community-sort-select"
                value={sort}
                onChange={handleSortChange}
                aria-label="정렬 기준 선택"
              >
                <option value="latest">최신순</option>
                <option value="popular">인기순</option>
              </select>

              <Link to="/community/write" className="community-write-button">
                글쓰기
              </Link>
            </div>
          )}
        </section>

        {/* 선택된 탭의 내용. 스크린리더가 어느 탭의 내용인지 알 수 있게 탭과 이어 둔다. */}
        <div {...panelProps}>
          {showJobs ? (
            <JobBoard />
          ) : (
            <>
              <section className="community-post-list" aria-label="커뮤니티 게시글 목록">
                {loading ? (
                  <div className="community-empty-state">불러오는 중...</div>
                ) : error ? (
                  <div className="community-empty-state">{error}</div>
                ) : posts.length === 0 ? (
                  <div className="community-empty-state">조건에 맞는 게시글이 없습니다.</div>
                ) : (
                  posts.map((post) => <PostCard key={post.id} post={post} />)
                )}
              </section>

              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default CommunityPage
